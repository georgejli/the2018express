import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Mail, ArrowLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

interface OrderDetails {
  id: string;
  event_name: string;
  event_date: string;
  ticket_type: string;
  quantity: number;
  total_amount: number;
  customer_name: string;
  customer_email: string;
}

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("ticket_orders")
          .select("*")
          .eq("stripe_session_id", sessionId)
          .maybeSingle();

        if (!error && data) {
          setOrder(data as OrderDetails);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [sessionId]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex flex-1 items-center justify-center px-4 pt-16">
        <div className="w-full max-w-lg text-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading your order...</p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-green-500/20 p-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
              </div>

              <h1 className="mb-4 font-display text-4xl text-foreground">
                Payment Successful!
              </h1>

              <p className="mb-8 text-muted-foreground">
                Thank you for your purchase. Your tickets have been confirmed.
              </p>

              {order && (
                <div className="mb-8 rounded-xl border border-border bg-card p-6 text-left">
                  <h2 className="mb-4 font-display text-xl text-foreground">
                    Order Summary
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Event</span>
                      <span className="text-foreground">{order.event_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="text-foreground">{order.event_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ticket Type</span>
                      <span className="text-foreground">{order.ticket_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity</span>
                      <span className="text-foreground">{order.quantity}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-3">
                      <span className="font-semibold text-foreground">Total</span>
                      <span className="font-display text-xl text-accent">
                        ${order.total_amount}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-8 flex items-center justify-center gap-3 rounded-lg border border-primary/30 bg-primary/10 p-4">
                <Mail className="h-5 w-5 text-primary" />
                <p className="text-sm text-foreground">
                  A confirmation email with your tickets has been sent to{" "}
                  <strong>{order?.customer_email || "your email"}</strong>
                </p>
              </div>

              <Link
                to="/"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
