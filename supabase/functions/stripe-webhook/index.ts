import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err });
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Event verified", { type: event.type });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;
      const paymentIntent = session.payment_intent as string;

      logStep("Processing completed checkout", { sessionId: session.id, paymentIntent, metadata });

      if (!metadata) {
        throw new Error("No metadata found in session");
      }

      // Generate QR code for the ticket
      const qrCode = crypto.randomUUID();

      // Calculate total amount
      const quantity = parseInt(metadata.quantity || "1");
      const unitPrice = parseInt(metadata.unit_price || "0");
      const totalAmount = unitPrice * quantity;

      // Create the order now that payment is confirmed
      const { data: order, error: orderError } = await supabase
        .from("ticket_orders")
        .insert({
          event_id: metadata.event_id,
          event_date: metadata.event_date,
          event_name: metadata.event_name,
          ticket_type: metadata.ticket_type,
          quantity,
          unit_price: unitPrice,
          total_amount: totalAmount,
          customer_name: metadata.customer_name,
          customer_email: metadata.customer_email,
          customer_phone: metadata.customer_phone,
          subscribe_to_updates: metadata.subscribe_to_updates === "true",
          qr_code: qrCode,
          status: "completed",
          stripe_session_id: session.id,
          stripe_payment_intent: paymentIntent,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (orderError) {
        logStep("Order creation error", orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      logStep("Order created successfully", { orderId: order.id });

      // Trigger email sending
      try {
        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-ticket-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ orderId: order.id }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          logStep("Email function failed", { status: emailResponse.status, error: errorText });
        } else {
          logStep("Email function triggered successfully");
        }
      } catch (emailError) {
        logStep("Failed to trigger email function", { error: emailError });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
