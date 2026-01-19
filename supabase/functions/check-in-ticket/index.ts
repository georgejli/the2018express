import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-IN-TICKET] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      throw new Error("Unauthorized");
    }

    const userId = claimsData.claims.sub as string;

    // Check if requesting user is admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      throw new Error("Only admins can check in tickets");
    }

    const { qrCode } = await req.json();
    
    if (!qrCode) {
      throw new Error("QR code is required");
    }

    // Clean and normalize the QR code (trim whitespace, handle URL-encoded values)
    const cleanedQrCode = decodeURIComponent(qrCode.toString().trim());
    logStep("Processing check-in", { originalQrCode: qrCode, cleanedQrCode });

    // Find the ticket order by QR code
    const { data: order, error: orderError } = await supabaseAdmin
      .from("ticket_orders")
      .select("*")
      .eq("qr_code", cleanedQrCode)
      .maybeSingle();

    if (orderError) {
      logStep("Error finding order", orderError);
      throw new Error("Failed to find ticket");
    }

    if (!order) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "TICKET_NOT_FOUND",
          message: "No ticket found with this QR code" 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if order is completed (paid)
    if (order.status !== "completed") {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "TICKET_NOT_PAID",
          message: `Ticket payment status: ${order.status}. Only paid tickets can be checked in.`,
          order: {
            customer_name: order.customer_name,
            ticket_type: order.ticket_type,
            quantity: order.quantity,
            status: order.status
          }
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already checked in
    if (order.checked_in) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "ALREADY_CHECKED_IN",
          message: "This ticket has already been used",
          order: {
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            ticket_type: order.ticket_type,
            quantity: order.quantity,
            event_name: order.event_name,
            event_date: order.event_date,
            checked_in_at: order.checked_in_at
          }
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark as checked in
    const { error: updateError } = await supabaseAdmin
      .from("ticket_orders")
      .update({
        checked_in: true,
        checked_in_at: new Date().toISOString(),
        checked_in_by: userId
      })
      .eq("id", order.id);

    if (updateError) {
      logStep("Error updating order", updateError);
      throw new Error("Failed to check in ticket");
    }

    logStep("Check-in successful", { orderId: order.id, customer: order.customer_name });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Check-in successful!",
        order: {
          id: order.id,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          ticket_type: order.ticket_type,
          quantity: order.quantity,
          event_name: order.event_name,
          event_date: order.event_date
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
