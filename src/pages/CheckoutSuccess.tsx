import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Mail, ArrowLeft, Loader2, MapPin, Calendar, Ticket } from "lucide-react";
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
  unit_price: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  qr_code: string;
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

  // Generate QR code URL using the same API as the email
  const qrCodeUrl = order?.qr_code 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(order.qr_code)}`
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="w-full max-w-2xl">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading your order...</p>
            </div>
          ) : (
            <>
              {/* Success Header */}
              <div className="mb-8 text-center">
                <div className="mb-6 flex justify-center">
                  <div className="rounded-full bg-green-500/20 p-4">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                </div>

                <h1 className="mb-4 font-display text-4xl text-foreground">
                  Payment Successful!
                </h1>

                <p className="text-muted-foreground">
                  Thank you for your purchase. Your tickets have been confirmed.
                </p>
              </div>

              {order && (
                <>
                  {/* Ticket Card */}
                  <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-card/80">
                    {/* Ticket Header */}
                    <div className="border-b border-border bg-muted/30 p-4 text-center">
                      <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-bold ${
                        order.ticket_type === 'VIP' 
                          ? 'bg-gradient-to-r from-accent to-yellow-500 text-accent-foreground' 
                          : 'bg-primary text-primary-foreground'
                      }`}>
                        {order.ticket_type === 'VIP' ? '⭐ VIP ACCESS' : 'GENERAL ADMISSION'}
                      </span>
                    </div>

                    {/* Ticket Body */}
                    <div className="p-6">
                      <h2 className="mb-6 text-center font-display text-2xl text-foreground">
                        {order.event_name}
                      </h2>

                      <div className="mb-6 grid grid-cols-2 gap-4 text-center">
                        <div className="rounded-lg bg-muted/50 p-4">
                          <Calendar className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                          <p className="text-xs uppercase text-muted-foreground">Date</p>
                          <p className="font-semibold text-foreground">{order.event_date}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-4">
                          <Ticket className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                          <p className="text-xs uppercase text-muted-foreground">Quantity</p>
                          <p className="font-semibold text-foreground">{order.quantity} ticket(s)</p>
                        </div>
                      </div>

                      {/* Attendee Info */}
                      <div className="mb-6 space-y-2 border-t border-dashed border-border pt-6">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Attendee</span>
                          <span className="font-medium text-foreground">{order.customer_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Email</span>
                          <span className="font-medium text-foreground">{order.customer_email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Phone</span>
                          <span className="font-medium text-foreground">{order.customer_phone}</span>
                        </div>
                      </div>

                      {/* QR Code Section */}
                      {qrCodeUrl && (
                        <div className="flex flex-col items-center rounded-xl bg-white p-6">
                          <img 
                            src={qrCodeUrl} 
                            alt="Ticket QR Code" 
                            className="h-48 w-48"
                          />
                          <p className="mt-3 text-sm font-medium text-gray-700">Scan at entry</p>
                          <p className="mt-1 font-mono text-xs text-gray-500">
                            ID: {order.qr_code}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="mb-6 rounded-xl border border-border bg-card p-6">
                    <h3 className="mb-4 font-display text-lg text-foreground">Order Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {order.ticket_type} Ticket × {order.quantity}
                        </span>
                        <span className="text-foreground">
                          ${(order.unit_price * order.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-3">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="font-display text-xl text-accent">
                          ${order.total_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Venue Info */}
                  <div className="mb-6 flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                    <div className="rounded-full bg-muted p-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">The New Yorker Hotel</p>
                      <p className="text-sm text-muted-foreground">481 8th Ave, New York, NY</p>
                    </div>
                  </div>
                </>
              )}

              {/* Email Confirmation Notice */}
              <div className="mb-8 flex items-center justify-center gap-3 rounded-lg border border-primary/30 bg-primary/10 p-4">
                <Mail className="h-5 w-5 text-primary" />
                <p className="text-sm text-foreground">
                  A confirmation email with your tickets has been sent to{" "}
                  <strong>{order?.customer_email || "your email"}</strong>
                </p>
              </div>

              <div className="text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
