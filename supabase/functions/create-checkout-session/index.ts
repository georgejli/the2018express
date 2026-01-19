import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Stripe Price IDs for ticket types
const STRIPE_PRICES = {
  GA: "price_1Sr7c7GXCheOPsDr5AL1aYG2",
  VIP: "price_1Sr7i5GXCheOPsDrGfEsE3fW",
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

    // Validate ticket type
    if (!STRIPE_PRICES[ticketType]) {
      throw new Error(`Invalid ticket type: ${ticketType}`);
    }

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing Stripe customer", { customerId });
    }

    // Get origin with fallback
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "https://id-preview--dd3d4a70-8a1e-472a-90eb-6def21091e9c.lovable.app";
    logStep("Using origin", { origin });

    // Create Stripe Checkout session - order will be created by webhook after payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: [
        {
          price: STRIPE_PRICES[ticketType],
          quantity,
        },
      ],
      mode: "payment",
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: {
        event_id: eventId,
        event_name: eventName,
        event_date: eventDate,
        ticket_type: ticketType,
        quantity: quantity.toString(),
        unit_price: unitPrice.toString(),
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        subscribe_to_updates: subscribeToUpdates.toString(),
      },
    });

    logStep("Stripe session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
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
