import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success("Thanks for subscribing!");
      setEmail("");
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
          />
          <Button 
            type="submit" 
            className="h-12 bg-accent px-8 font-display text-lg tracking-tight text-accent-foreground hover:bg-accent/90"
          >
            SIGN UP
          </Button>
        </form>
      </div>
    </section>
  );
};

export default NewsletterSignup;
