import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image, Loader2 } from "lucide-react";

const BUCKET = "site-assets";
const HERO_SIGN_PATH = "hero-sign.png";

const HeroBannerManager = () => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const currentUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${HERO_SIGN_PATH}`;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 5MB allowed.", variant: "destructive" });
      return;
    }

    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(HERO_SIGN_PATH, file, { upsert: true, cacheControl: "60" });

      if (error) throw error;

      toast({ title: "Hero sign updated!", description: "The new sign image is now live." });
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Image className="h-5 w-5" />
          Hero Banner Sign
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Upload a new street sign image for the homepage hero banner. The image will replace the current sign immediately.
        </p>

        {/* Current image preview */}
        <div className="flex items-center gap-4">
          <div className="rounded-lg border border-border bg-secondary/50 p-2">
            <img
              src={preview || currentUrl}
              alt="Current hero sign"
              className="h-32 w-auto object-contain"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </div>
          {preview && (
            <span className="text-xs text-accent font-semibold">New preview</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            Choose Image
          </Button>
          {preview && (
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {uploading ? "Uploading..." : "Save & Publish"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HeroBannerManager;
