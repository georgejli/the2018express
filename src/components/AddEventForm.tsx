import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

interface AddEventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export default function AddEventForm({ isOpen, onClose, onSuccess, defaultEvent }: AddEventFormProps) {
  const [saving, setSaving] = useState(false);
  const [gaFeatures, setGaFeatures] = useState<string[]>(defaultEvent?.gaFeatures || DEFAULT_GA_FEATURES);
  const [vipFeatures, setVipFeatures] = useState<string[]>(defaultEvent?.vipFeatures || DEFAULT_VIP_FEATURES);
  const [newGaFeature, setNewGaFeature] = useState("");
  const [newVipFeature, setNewVipFeature] = useState("");
  const { toast } = useToast();

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      venue: defaultEvent?.venue || "The New Yorker Hotel",
      address: defaultEvent?.address || "481 8th Ave, New York, NY",
      gaPrice: defaultEvent?.gaPrice || 10,
      vipPrice: defaultEvent?.vipPrice || 15,
      startTime: "10:00",
      endTime: "18:00",
      earlyBirdTime: "09:00",
      description: "",
      poster: "",
    },
  });

  const handleSubmit = async (data: EventFormData) => {
    setSaving(true);

    try {
      const eventDate = data.date;
      const month = MONTHS[eventDate.getMonth()];
      const year = eventDate.getFullYear().toString();
      const date = eventDate.getDate().toString();
      const dayOfWeek = DAYS_OF_WEEK[eventDate.getDay()];
      const eventId = `${month.toLowerCase()}-${year}`;

      // Format time as "10:00 AM - 6:00 PM"
      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
      };

      const timeRange = `${formatTime(data.startTime)} - ${formatTime(data.endTime)}`;
      const earlyBirdDisplay = data.earlyBirdTime ? formatTime(data.earlyBirdTime) : null;

      const { error } = await supabase.from("events").insert({
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
        poster: data.poster || null,
      });

      if (error) throw error;

      toast({
        title: "Event created!",
        description: `Event for ${month} ${date}, ${year} has been created.`,
      });

      onSuccess();
      onClose();
      form.reset();
    } catch (error: any) {
      toast({
        title: "Failed to create event",
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
          <DialogTitle className="text-foreground">Add New Event</DialogTitle>
          <DialogDescription>
            Create a new card show event. Fields are pre-filled with the most recent event defaults.
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

          {/* Poster URL */}
          <div className="space-y-2">
            <Label htmlFor="poster">Poster URL (Optional)</Label>
            <Input
              id="poster"
              placeholder="https://example.com/poster.jpg"
              {...form.register("poster")}
              className="bg-secondary"
            />
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
              {saving ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
