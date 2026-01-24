import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Check, X, Mail, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type UnsubscribeStatus = "loading" | "success" | "error" | "invalid";

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<UnsubscribeStatus>("loading");
  const [message, setMessage] = useState("");

  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      setStatus("invalid");
      setMessage("Invalid unsubscribe link. Please use the link from your email.");
      return;
    }

    const unsubscribe = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/unsubscribe-newsletter`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "You have been unsubscribed successfully.");
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to unsubscribe. Please try again.");
        }
      } catch (error) {
        console.error("Unsubscribe error:", error);
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again later.");
      }
    };

    unsubscribe();
  }, [email]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            {status === "loading" && (
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}
            {status === "success" && (
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-500" />
              </div>
            )}
            {(status === "error" || status === "invalid") && (
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                <X className="w-8 h-8 text-destructive" />
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {status === "loading" && "Unsubscribing..."}
            {status === "success" && "Unsubscribed"}
            {status === "error" && "Oops!"}
            {status === "invalid" && "Invalid Link"}
          </h1>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground">{message}</p>
          
          {status === "success" && (
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <Mail className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p>Changed your mind? You can always resubscribe on our website.</p>
            </div>
          )}

          <Button asChild variant="outline" className="w-full">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Unsubscribe;
