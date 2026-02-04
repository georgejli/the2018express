import { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Celebrity } from "@/hooks/useCelebrities";

const celebrityFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  bio: z.string().min(1, "Bio is required").max(500),
  website: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

type CelebrityFormValues = z.infer<typeof celebrityFormSchema>;

interface CelebrityFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingCelebrity?: Celebrity;
  onSave: (data: {
    name: string;
    bio: string;
    photo_url: string | null;
    website: string | null;
  }) => Promise<void>;
}

const CelebrityFormDialog = ({
  isOpen,
  onClose,
  existingCelebrity,
  onSave,
}: CelebrityFormDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CelebrityFormValues>({
    resolver: zodResolver(celebrityFormSchema),
    defaultValues: {
      name: "",
      bio: "",
      website: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: existingCelebrity?.name || "",
        bio: existingCelebrity?.bio || "",
        website: existingCelebrity?.website || "",
      });
      setPhotoUrl(existingCelebrity?.photo_url || null);
    }
  }, [isOpen, existingCelebrity, form]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", { description: "Maximum file size is 5MB" });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", { description: "Please upload an image file" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `celebrities/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("event-media")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("event-media").getPublicUrl(fileName);
      setPhotoUrl(data.publicUrl);
      toast.success("Photo uploaded");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: CelebrityFormValues) => {
    setIsSubmitting(true);
    try {
      await onSave({
        name: data.name,
        bio: data.bio,
        photo_url: photoUrl,
        website: data.website || null,
      });
      toast.success(existingCelebrity ? "Celebrity updated" : "Celebrity added");
      onClose();
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = existingCelebrity ? "Edit Celebrity" : "Add Celebrity";

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose}>
      <ResponsiveDialogContent className="sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Photo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Photo</label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-border bg-secondary">
                  {photoUrl ? (
                    <>
                      <img
                        src={photoUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoUrl(null)}
                        className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload Photo"
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ResponsiveDialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </ResponsiveDialogFooter>
          </form>
        </Form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
};

export default CelebrityFormDialog;
