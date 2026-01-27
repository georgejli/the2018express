import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { FeaturedCelebrity } from "@/hooks/useFeaturedCelebrities";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface FeaturedCelebrityFormProps {
  isOpen: boolean;
  onClose: () => void;
  existingCelebrity?: FeaturedCelebrity;
  onSave: (data: { name: string; bio: string; photo_url: string | null; website: string | null }) => Promise<void>;
}

const FeaturedCelebrityForm = ({ isOpen, onClose, existingCelebrity, onSave }: FeaturedCelebrityFormProps) => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (existingCelebrity) {
      setName(existingCelebrity.name);
      setBio(existingCelebrity.bio);
      setPhotoUrl(existingCelebrity.photo_url);
      setWebsite(existingCelebrity.website || "");
    } else {
      setName("");
      setBio("");
      setPhotoUrl(null);
      setWebsite("");
    }
  }, [existingCelebrity, isOpen]);

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
      const fileName = `featured-celebrities/${Date.now()}.${fileExt}`;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        bio: bio.trim(),
        photo_url: photoUrl,
        website: website.trim() || null,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{existingCelebrity ? "Edit Celebrity" : "Add Celebrity"}</DialogTitle>
          <DialogDescription>
            Add or edit featured celebrity information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Photo</Label>
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

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Celebrity name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio *</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief description..."
              required
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input
              id="website"
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !name.trim() || !bio.trim()}>
              {isSaving ? "Saving..." : existingCelebrity ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeaturedCelebrityForm;
