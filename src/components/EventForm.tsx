import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, X, Upload, ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Event } from "@/data/events";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const eventSchema = z.object({
  date: z.date({ required_error: "Event date is required" }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  earlyBirdTime: z.string().optional(),
  venue: z.string().min(1, "Venue is required").max(200),
  address: z.string().min(1, "Address is required").max(500),
  gaPrice: z.number().min(0, "Price must be positive"),
  vipPrice: z.number().min(0, "Price must be positive"),
  description: z.string().max(1000).optional(),
  poster: z.string().url().optional().or(z.literal("")),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "add" | "edit";
  editEvent?: (Event & { description?: string; dbId?: string }) | null;
  defaultEvent?: {
    venue: string;
    address: string;
    gaPrice: number;
    vipPrice: number;
    gaFeatures: string[];
    vipFeatures: string[];
  };
}

const DEFAULT_GA_FEATURES = [
  "Access to all vendor tables",
  "Browse thousands of sports cards",
  "Meet fellow collectors",
  "Entry after 10:00 AM",
  "Meet special guests",
];

const DEFAULT_VIP_FEATURES = [
  "Early entry at 9:00 AM",
  "Exclusive VIP access to merchandise",
  "First access to guest meet and greets",
  "Priority access to all vendors",
];

// Parse time string like "10:00 AM - 6:00 PM" to get start/end times
function parseTimeRange(timeRange: string): { startTime: string; endTime: string } {
  const parts = timeRange.split(" - ");
  if (parts.length !== 2) return { startTime: "10:00", endTime: "18:00" };
  
  const parseTime = (t: string): string => {
    const match = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return "10:00";
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  return {
    startTime: parseTime(parts[0]),
    endTime: parseTime(parts[1]),
  };
}

// Parse early bird time like "9:00 AM" to 24h format
function parseEarlyBirdTime(time: string | undefined): string {
  if (!time) return "";
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return "";
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

export default function EventForm({ isOpen, onClose, onSuccess, mode, editEvent, defaultEvent }: EventFormProps) {
  const [saving, setSaving] = useState(false);
  const [gaFeatures, setGaFeatures] = useState<string[]>(DEFAULT_GA_FEATURES);
  const [vipFeatures, setVipFeatures] = useState<string[]>(DEFAULT_VIP_FEATURES);
  const [newGaFeature, setNewGaFeature] = useState("");
  const [newVipFeature, setNewVipFeature] = useState("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const isEdit = mode === "edit";

  // Initialize form with proper defaults
  const getDefaultValues = (): Partial<EventFormData> => {
    if (isEdit && editEvent) {
      const monthIndex = MONTHS.indexOf(editEvent.month.toUpperCase());
      const eventDate = new Date(
        parseInt(editEvent.year),
        monthIndex,
        parseInt(editEvent.date)
      );
      const { startTime, endTime } = parseTimeRange(editEvent.time);
      
      return {
        date: eventDate,
        startTime,
        endTime,
        earlyBirdTime: parseEarlyBirdTime(editEvent.earlyBirdTime),
        venue: editEvent.venue,
        address: editEvent.address,
        gaPrice: editEvent.gaPrice,
        vipPrice: editEvent.vipPrice,
        description: editEvent.description || "",
        poster: editEvent.poster || "",
      };
    }
    
    return {
      venue: defaultEvent?.venue || "The New Yorker Hotel",
      address: defaultEvent?.address || "481 8th Ave, New York, NY",
      gaPrice: defaultEvent?.gaPrice || 10,
      vipPrice: defaultEvent?.vipPrice || 15,
      startTime: "10:00",
      endTime: "18:00",
      earlyBirdTime: "09:00",
      description: "",
      poster: "",
    };
  };

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: getDefaultValues(),
  });

  // Reset form when dialog opens or editEvent changes
  useEffect(() => {
    if (isOpen) {
      const defaults = getDefaultValues();
      form.reset(defaults);
      
      if (isEdit && editEvent) {
        setGaFeatures(editEvent.gaFeatures || DEFAULT_GA_FEATURES);
        setVipFeatures(editEvent.vipFeatures || DEFAULT_VIP_FEATURES);
        setPosterPreview(editEvent.poster || null);
      } else {
        setGaFeatures(defaultEvent?.gaFeatures || DEFAULT_GA_FEATURES);
        setVipFeatures(defaultEvent?.vipFeatures || DEFAULT_VIP_FEATURES);
        setPosterPreview(null);
      }
      setPosterFile(null);
    }
  }, [isOpen, editEvent, mode]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB.",
          variant: "destructive",
        });
        return;
      }
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
      form.setValue("poster", ""); // Clear URL input when file is selected
    }
  };

  const uploadPoster = async (eventId: string): Promise<string | null> => {
    if (!posterFile) return form.getValues("poster") || null;

    setUploadingPoster(true);
    try {
      const fileExt = posterFile.name.split(".").pop();
      const fileName = `${eventId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("event-posters")
        .upload(fileName, posterFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("event-posters")
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Failed to upload poster",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingPoster(false);
    }
  };

  const removePoster = () => {
    setPosterFile(null);
    setPosterPreview(null);
    form.setValue("poster", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (data: EventFormData) => {
    setSaving(true);

    try {
      const eventDate = data.date;
      const month = MONTHS[eventDate.getMonth()];
      const year = eventDate.getFullYear().toString();
      const date = eventDate.getDate().toString();
      const dayOfWeek = DAYS_OF_WEEK[eventDate.getDay()];
      const eventId = `${month.toLowerCase()}-${year}`;

      // Upload poster if a new file was selected
      const posterUrl = await uploadPoster(eventId);

      // Format time as "10:00 AM - 6:00 PM"
      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
      };

      const timeRange = `${formatTime(data.startTime)} - ${formatTime(data.endTime)}`;
      const earlyBirdDisplay = data.earlyBirdTime ? formatTime(data.earlyBirdTime) : null;

      const eventData = {
        event_id: eventId,
        date,
        month,
        year,
        day_of_week: dayOfWeek,
        time: timeRange,
        early_bird_time: earlyBirdDisplay,
        venue: data.venue,
        address: data.address,
        ga_price: data.gaPrice,
        vip_price: data.vipPrice,
        ga_features: gaFeatures,
        vip_features: vipFeatures,
        description: data.description || null,
        poster: posterUrl,
      };

      if (isEdit && editEvent?.dbId) {
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", editEvent.dbId);
        
        if (error) throw error;
        
        toast({
          title: "Event updated!",
          description: `Event for ${month} ${date}, ${year} has been updated.`,
        });
      } else {
        const { error } = await supabase.from("events").insert(eventData);
        
        if (error) throw error;
        
        toast({
          title: "Event created!",
          description: `Event for ${month} ${date}, ${year} has been created.`,
        });
      }

      onSuccess();
      onClose();
      form.reset();
    } catch (error: any) {
      toast({
        title: isEdit ? "Failed to update event" : "Failed to create event",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addGaFeature = () => {
    if (newGaFeature.trim()) {
      setGaFeatures([...gaFeatures, newGaFeature.trim()]);
      setNewGaFeature("");
    }
  };

  const removeGaFeature = (index: number) => {
    setGaFeatures(gaFeatures.filter((_, i) => i !== index));
  };

  const addVipFeature = () => {
    if (newVipFeature.trim()) {
      setVipFeatures([...vipFeatures, newVipFeature.trim()]);
      setNewVipFeature("");
    }
  };

  const removeVipFeature = (index: number) => {
    setVipFeatures(vipFeatures.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEdit ? "Edit Event" : "Add New Event"}
          </DialogTitle>
          <DialogDescription>
            {isEdit 
              ? "Update the event details below."
              : "Create a new card show event. Fields are pre-filled with the most recent event defaults."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Event Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start bg-secondary text-left font-normal",
                    !form.watch("date") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch("date") ? format(form.watch("date"), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.watch("date")}
                  onSelect={(date) => date && form.setValue("date", date)}
                  initialFocus
                  className="pointer-events-auto p-3"
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.date && (
              <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
            )}
          </div>

          {/* Time Selection */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                {...form.register("startTime")}
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                {...form.register("endTime")}
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="earlyBirdTime">Early Bird Time (Optional)</Label>
              <Input
                id="earlyBirdTime"
                type="time"
                {...form.register("earlyBirdTime")}
                className="bg-secondary"
              />
            </div>
          </div>

          {/* Venue */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="venue">Venue Name</Label>
              <Input id="venue" {...form.register("venue")} className="bg-secondary" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...form.register("address")} className="bg-secondary" />
            </div>
          </div>

          {/* Prices */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gaPrice">GA Price ($)</Label>
              <Input
                id="gaPrice"
                type="number"
                min={0}
                {...form.register("gaPrice", { valueAsNumber: true })}
                className="bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vipPrice">VIP Price ($)</Label>
              <Input
                id="vipPrice"
                type="number"
                min={0}
                {...form.register("vipPrice", { valueAsNumber: true })}
                className="bg-secondary"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add a special description for this event..."
              {...form.register("description")}
              className="min-h-[100px] bg-secondary"
            />
          </div>

          {/* Poster Upload */}
          <div className="space-y-2">
            <Label>Event Poster (Optional)</Label>
            <div className="space-y-3">
              {/* Preview */}
              {posterPreview && (
                <div className="relative inline-block">
                  <img
                    src={posterPreview}
                    alt="Poster preview"
                    className="h-32 w-auto rounded-md border border-border object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -right-2 -top-2 h-6 w-6"
                    onClick={removePoster}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {/* Upload Button */}
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="poster-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPoster}
                  className="gap-2"
                >
                  {uploadingPoster ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : posterPreview ? (
                    <ImageIcon className="h-4 w-4" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {posterPreview ? "Change Image" : "Upload Image"}
                </Button>
                <span className="text-xs text-muted-foreground">or</span>
              </div>

              {/* URL Input */}
              <Input
                id="poster"
                placeholder="Paste image URL..."
                {...form.register("poster")}
                className="bg-secondary"
                onChange={(e) => {
                  form.setValue("poster", e.target.value);
                  if (e.target.value) {
                    setPosterFile(null);
                    setPosterPreview(e.target.value);
                  }
                }}
              />
            </div>
          </div>

          {/* GA Features */}
          <div className="space-y-2">
            <Label>GA Features</Label>
            <div className="space-y-2">
              {gaFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-1 rounded bg-secondary px-3 py-1.5 text-sm">{feature}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGaFeature(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Add GA feature..."
                  value={newGaFeature}
                  onChange={(e) => setNewGaFeature(e.target.value)}
                  className="bg-secondary"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGaFeature())}
                />
                <Button type="button" variant="outline" size="sm" onClick={addGaFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* VIP Features */}
          <div className="space-y-2">
            <Label>VIP Features</Label>
            <div className="space-y-2">
              {vipFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="flex-1 rounded bg-secondary px-3 py-1.5 text-sm">{feature}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVipFeature(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Add VIP feature..."
                  value={newVipFeature}
                  onChange={(e) => setNewVipFeature(e.target.value)}
                  className="bg-secondary"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addVipFeature())}
                />
                <Button type="button" variant="outline" size="sm" onClick={addVipFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (isEdit ? "Saving..." : "Creating...") : (isEdit ? "Save Changes" : "Create Event")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
