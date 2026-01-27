import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { FeaturedCelebrity } from "@/hooks/useFeaturedCelebrities";

interface FeaturedCelebrityFormProps {
  isOpen: boolean;
  onClose: () => void;
  existingCelebrity?: FeaturedCelebrity;
  onSave: (data: { name: string; bio: string; photo_url: string | null; website: string | null }) => Promise<void>;
}

const FeaturedCelebrityForm = ({ isOpen, onClose, existingCelebrity, onSave }: FeaturedCelebrityFormProps) => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (existingCelebrity) {
      setName(existingCelebrity.name);
      setBio(existingCelebrity.bio);
      setPhotoUrl(existingCelebrity.photo_url || "");
      setWebsite(existingCelebrity.website || "");
    } else {
      setName("");
      setBio("");
      setPhotoUrl("");
      setWebsite("");
    }
  }, [existingCelebrity, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        bio: bio.trim(),
        photo_url: photoUrl.trim() || null,
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
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Label htmlFor="photo">Photo URL</Label>
            <Input
              id="photo"
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
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
