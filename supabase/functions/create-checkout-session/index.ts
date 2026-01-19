import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

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

// Input validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-\+\(\)]{10,20}$/;

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 300000; // 5 minutes
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 checkout attempts per 5 min

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

async function checkRateLimit(clientIP: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(clientIP);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const ipHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
  
  const now = Date.now();
  const entry = rateLimitMap.get(ipHash);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ipHash, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Get or create a Stripe product and price for a specific event + ticket type
async function getOrCreateEventPrice(
  stripe: Stripe,
  eventDate: string,
  ticketType: "GA" | "VIP",
  unitPrice: number
): Promise<string> {
  const ticketName = ticketType === "GA" ? "GA Ticket" : "VIP Ticket";
  const productName = `${eventDate} ${ticketName}`;
  
  console.log(`[CREATE-CHECKOUT] Looking for product: ${productName}`);
  
  // Search for existing product by name
  const products = await stripe.products.search({
    query: `name:'${productName}'`,
    limit: 1,
  });
  
  let productId: string;
  
  if (products.data.length > 0) {
    productId = products.data[0].id;
    console.log(`[CREATE-CHECKOUT] Found existing product: ${productId}`);
  } else {
    // Create new product
    const product = await stripe.products.create({
      name: productName,
      description: `${ticketType === "GA" ? "General Admission" : "VIP"} ticket for The 34th St Card Show on ${eventDate}`,
      metadata: {
        event_date: eventDate,
        ticket_type: ticketType,
      },
    });
    productId = product.id;
    console.log(`[CREATE-CHECKOUT] Created new product: ${productId}`);
  }
  
  // Check for existing active price with correct amount
  const prices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 10,
  });
  
  const priceInCents = unitPrice * 100;
  const existingPrice = prices.data.find((p: Stripe.Price) => p.unit_amount === priceInCents);
  
  if (existingPrice) {
    console.log(`[CREATE-CHECKOUT] Found existing price: ${existingPrice.id}`);
    return existingPrice.id;
  }
  
  // Create new price
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: priceInCents,
    currency: "usd",
    metadata: {
      event_date: eventDate,
      ticket_type: ticketType,
    },
  });
  
  console.log(`[CREATE-CHECKOUT] Created new price: ${price.id}`);
  return price.id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[CREATE-CHECKOUT] Function started");

    // Rate limiting check
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    
    const allowed = await checkRateLimit(clientIP);
    if (!allowed) {
      console.log("[CREATE-CHECKOUT] Rate limit exceeded");
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "300" },
        }
      );
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body: CheckoutRequest = await req.json();
    console.log("[CREATE-CHECKOUT] Processing checkout request");

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
    if (ticketType !== "GA" && ticketType !== "VIP") {
      throw new Error("Invalid ticket type");
    }

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error("Quantity must be between 1 and 10");
    }

    // Validate customer name
    const trimmedName = customerName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      throw new Error("Name must be between 2 and 100 characters");
    }

    // Validate email format
    const trimmedEmail = customerEmail.trim().toLowerCase();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      throw new Error("Invalid email format");
    }
    if (trimmedEmail.length > 255) {
      throw new Error("Email must be less than 255 characters");
    }

    // Validate phone format
    const trimmedPhone = customerPhone.trim();
    if (!PHONE_REGEX.test(trimmedPhone)) {
      throw new Error("Invalid phone number format");
    }

    // Validate event data
    if (!eventId || eventId.length > 100) {
      throw new Error("Invalid event ID");
    }
    if (!eventName || eventName.length > 200) {
      throw new Error("Invalid event name");
    }
    if (!eventDate || eventDate.length > 50) {
      throw new Error("Invalid event date");
    }

    // Get or create event-specific product and price
    const priceId = await getOrCreateEventPrice(stripe, eventDate, ticketType, unitPrice);

    // Check if customer exists in Stripe
    const customers = await stripe.customers.list({ email: trimmedEmail, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("[CREATE-CHECKOUT] Found existing Stripe customer");
    }

    // Get origin with fallback
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || "https://id-preview--dd3d4a70-8a1e-472a-90eb-6def21091e9c.lovable.app";
    console.log("[CREATE-CHECKOUT] Using origin for redirects");

    // Create Stripe Checkout session - order will be created by webhook after payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : trimmedEmail,
      line_items: [
        {
          price: priceId,
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
        customer_name: trimmedName,
        customer_email: trimmedEmail,
        customer_phone: trimmedPhone,
        subscribe_to_updates: subscribeToUpdates.toString(),
      },
    });

    console.log("[CREATE-CHECKOUT] Stripe session created successfully");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("[CREATE-CHECKOUT] ERROR occurred:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});