import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke("subscribe-newsletter", {
        body: { email, source: "website" },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.alreadySubscribed) {
        toast.success(data.message || "You're already subscribed!");
      } else {
        toast.success(data.message || "Thanks for subscribing!");
      }
      
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="border-t border-border bg-background px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-2xl text-center">
        <h2 className="font-display text-4xl tracking-tight text-foreground md:text-5xl">
          BE THE <span className="text-gradient-gold">FIRST</span> TO KNOW
        </h2>
        <p className="mt-6 text-muted-foreground">
          Subscribe for talent, upcoming dates and programming announcements delivered straight to your inbox.
        </p>
        
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Input
            type="email"
            placeholder="name@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 bg-secondary text-foreground placeholder:text-muted-foreground sm:w-80"
            required
            disabled={isSubmitting}
          />
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="h-12 bg-accent px-8 font-display text-lg tracking-tight text-accent-foreground hover:bg-accent/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                SIGNING UP...
              </>
            ) : (
              "SIGN UP"
            )}
          </Button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSignup;
