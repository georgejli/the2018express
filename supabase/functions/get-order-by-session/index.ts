import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    // Input validation
    if (!sessionId || typeof sessionId !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid session ID" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate session ID format (Stripe session IDs start with cs_)
    if (!sessionId.startsWith("cs_")) {
      return new Response(
        JSON.stringify({ error: "Invalid session ID format" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Length check to prevent abuse
    if (sessionId.length > 200) {
      return new Response(
        JSON.stringify({ error: "Invalid session ID" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Step 1: Verify with Stripe that this session exists and is paid
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("[GET-ORDER] Stripe secret key not configured");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    let stripeSession;
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeError: unknown) {
      console.log("[GET-ORDER] Stripe session not found or invalid");
      // Don't reveal whether session exists or not
      return new Response(
        JSON.stringify({ order: null }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Step 2: Verify payment status - only return data for completed payments
    if (stripeSession.payment_status !== "paid") {
      console.log("[GET-ORDER] Session exists but payment not completed");
      return new Response(
        JSON.stringify({ order: null }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Step 3: Now that Stripe confirms this is a valid paid session, fetch from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: order, error } = await supabase
      .from("ticket_orders")
      .select(`
        id,
        event_name,
        event_date,
        ticket_type,
        quantity,
        total_amount,
        unit_price,
        customer_name,
        customer_email,
        customer_phone,
        qr_code
      `)
      .eq("stripe_session_id", sessionId)
      .eq("status", "completed")
      .maybeSingle();

    if (error) {
      console.error("[GET-ORDER] Database error occurred");
      return new Response(
        JSON.stringify({ error: "Failed to fetch order" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    if (!order) {
      // Session is valid in Stripe but order not yet in DB (webhook may be processing)
      return new Response(
        JSON.stringify({ order: null }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("[GET-ORDER] Order retrieved successfully");
    return new Response(
      JSON.stringify({ order }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("[GET-ORDER] Unexpected error occurred");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
