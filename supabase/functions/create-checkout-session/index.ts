import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  eventId: string;
  eventDate: string;
  eventName: string;
  ticketType: "GA" | "VIP";
  quantity: number;
  unitPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  subscribeToUpdates: boolean;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body: CheckoutRequest = await req.json();
    logStep("Request body", body);

    const {
      eventId,
      eventDate,
      eventName,
      ticketType,
      quantity,
      unitPrice,
      customerName,
      customerEmail,
      customerPhone,
      subscribeToUpdates,
    } = body;

    // Validate required fields
    if (!eventId || !ticketType || !quantity || !customerName || !customerEmail || !customerPhone) {
      throw new Error("Missing required fields");
    }

    const totalAmount = unitPrice * quantity;
    const qrCode = crypto.randomUUID();

    logStep("Creating order in database");

    // Create pending order in database
    const { data: order, error: orderError } = await supabase
      .from("ticket_orders")
      .insert({
        event_id: eventId,
        event_date: eventDate,
        event_name: eventName,
        ticket_type: ticketType,
        quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        subscribe_to_updates: subscribeToUpdates,
        qr_code: qrCode,
        status: "pending",
      })
      .select()
      .single();

    if (orderError) {
      logStep("Order creation error", orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    logStep("Order created", { orderId: order.id });

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${ticketType === "VIP" ? "VIP" : "General Admission"} Ticket - ${eventName}`,
              description: `${quantity} ticket(s) for ${eventDate}`,
            },
            unit_amount: unitPrice * 100, // Convert to cents
          },
          quantity,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout/cancel?order_id=${order.id}`,
      metadata: {
        order_id: order.id,
        event_id: eventId,
        qr_code: qrCode,
      },
    });

    logStep("Stripe session created", { sessionId: session.id });

    // Update order with Stripe session ID
    const { error: updateError } = await supabase
      .from("ticket_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    if (updateError) {
      logStep("Failed to update order with session ID", updateError);
    }

    return new Response(JSON.stringify({ url: session.url, orderId: order.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
