import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[STRIPE-WEBHOOK] Webhook received");
    console.log("[STRIPE-WEBHOOK] Method:", req.method);

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")?.trim(); // Trim whitespace
    
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    
    // Debug: Log webhook secret prefix to verify it's correct format
    console.log("[STRIPE-WEBHOOK] Webhook secret starts with:", webhookSecret.substring(0, 10));
    console.log("[STRIPE-WEBHOOK] Webhook secret length:", webhookSecret.length);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // CRITICAL: Get the raw body as text BEFORE any parsing
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    console.log("[STRIPE-WEBHOOK] Body length:", body.length);
    console.log("[STRIPE-WEBHOOK] Signature present:", !!signature);
    console.log("[STRIPE-WEBHOOK] Signature preview:", signature?.substring(0, 50));

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    let event: Stripe.Event;
    try {
      // Use async version for Deno/Edge Functions (SubtleCrypto requires async)
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.log("[STRIPE-WEBHOOK] Signature verification failed:", errorMessage);
      return new Response(JSON.stringify({ error: "Invalid signature", details: errorMessage }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[STRIPE-WEBHOOK] Event verified successfully:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;
      const paymentIntent = session.payment_intent as string;

      console.log("[STRIPE-WEBHOOK] Processing completed checkout");

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
        console.log("[STRIPE-WEBHOOK] Order creation error");
        throw new Error("Failed to create order");
      }

      console.log("[STRIPE-WEBHOOK] Order created successfully");

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
          console.log("[STRIPE-WEBHOOK] Email function failed");
        } else {
          console.log("[STRIPE-WEBHOOK] Email function triggered successfully");
        }
      } catch (emailError) {
        console.log("[STRIPE-WEBHOOK] Failed to trigger email function");
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("[STRIPE-WEBHOOK] ERROR occurred:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
