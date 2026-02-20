import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Type, Loader2, Save } from "lucide-react";

const BannerTextManager = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchText = async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ticker_text")
        .single();

      if (!error && data) {
        setText(data.value);
      }
      setLoading(false);
    };
    fetchText();
  }, []);

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({ value: text.trim(), updated_at: new Date().toISOString() })
        .eq("key", "ticker_text");

      if (error) throw error;

      toast({ title: "Banner text updated!", description: "The scrolling banner now shows the new text." });
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Type className="h-5 w-5" />
          Scroll Banner Text
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Edit the text that scrolls across the top banner on the homepage.
        </p>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. NEXT SHOW: SUN, MAY 31 2026"
              className="bg-secondary"
            />
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BannerTextManager;
