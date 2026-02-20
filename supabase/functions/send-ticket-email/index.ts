import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import QRCode from "https://esm.sh/qrcode@1.5.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderData {
  id: string;
  event_id: string;
  event_date: string;
  event_name: string;
  ticket_type: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  qr_code: string;
  created_at: string;
}

// Generate QR code as SVG string (works in Deno without canvas)
async function generateQRCodeSvg(data: string): Promise<string> {
  try {
    const svgString = await QRCode.toString(data, {
      type: 'svg',
      width: 200,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    return svgString;
  } catch (error) {
    console.error("[SEND-TICKET-EMAIL] QR code generation failed:", error);
    throw new Error("Failed to generate QR code");
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[SEND-TICKET-EMAIL] Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    
    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check authorization
    const authHeader = req.headers.get("Authorization");
    let isAuthorized = false;
    
    // Check if this is an internal service role call (from stripe-webhook)
    if (authHeader?.includes(supabaseServiceKey)) {
      console.log("[SEND-TICKET-EMAIL] Internal service role call - authorized");
      isAuthorized = true;
    } else if (authHeader?.startsWith("Bearer ")) {
      // External call - verify admin user
      console.log("[SEND-TICKET-EMAIL] External call - verifying admin auth");
      
      const supabaseClient = createClient(
        supabaseUrl,
        supabaseAnonKey,
        { global: { headers: { Authorization: authHeader } } }
      );
      
      const token = authHeader.replace("Bearer ", "");
      const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
      
      if (claimsError || !claimsData?.claims?.sub) {
        console.log("[SEND-TICKET-EMAIL] Invalid token");
        return new Response(JSON.stringify({ error: "Unauthorized - invalid token" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      const userId = claimsData.claims.sub;
      
      // Check if user has admin role
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      
      if (roleError || !roleData) {
        console.log("[SEND-TICKET-EMAIL] User is not an admin");
        return new Response(JSON.stringify({ error: "Forbidden - admin access required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      console.log("[SEND-TICKET-EMAIL] Admin user verified");
      isAuthorized = true;
    }
    
    if (!isAuthorized) {
      console.log("[SEND-TICKET-EMAIL] No authorization provided");
      return new Response(JSON.stringify({ error: "Unauthorized - authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) throw new Error("RESEND_API_KEY is not set");

    const resend = new Resend(resendApiKey);

    const { orderId } = await req.json();
    console.log("[SEND-TICKET-EMAIL] Processing order");

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    // Fetch order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from("ticket_orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.log("[SEND-TICKET-EMAIL] Failed to fetch order");
      throw new Error("Order not found");
    }

    const orderData = order as OrderData;
    console.log("[SEND-TICKET-EMAIL] Order fetched successfully");

    // Generate QR code as inline SVG (works in Deno without canvas)
    const qrCodeSvg = await generateQRCodeSvg(orderData.qr_code);
    console.log("[SEND-TICKET-EMAIL] QR code generated successfully");

    // Create email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Ticket - 34th St Card Show</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="text-align: center; padding: 30px 0; border-bottom: 1px solid #333;">
      <h1 style="margin: 0; font-size: 28px; color: #d4af37;">34TH ST CARD SHOW</h1>
      <p style="margin: 10px 0 0; color: #888;">Your Ticket Confirmation</p>
    </div>

    <!-- Ticket Card -->
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #262626 100%); border-radius: 16px; padding: 30px; margin: 30px 0; border: 1px solid #333;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="display: inline-block; background: ${orderData.ticket_type === 'VIP' ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)' : '#2563eb'}; color: ${orderData.ticket_type === 'VIP' ? '#000' : '#fff'}; padding: 8px 20px; border-radius: 20px; font-weight: bold; font-size: 14px;">
          ${orderData.ticket_type === 'VIP' ? '⭐ VIP ACCESS' : 'GENERAL ADMISSION'}
        </span>
      </div>

      <h2 style="text-align: center; margin: 0 0 20px; font-size: 24px; color: #fff;">${orderData.event_name}</h2>
      
      <div style="display: flex; justify-content: space-between; flex-wrap: wrap; margin-bottom: 20px;">
        <div style="flex: 1; min-width: 150px; margin: 10px 0;">
          <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase;">Date</p>
          <p style="margin: 5px 0 0; color: #fff; font-size: 16px;">${orderData.event_date}</p>
        </div>
        <div style="flex: 1; min-width: 150px; margin: 10px 0;">
          <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase;">Quantity</p>
          <p style="margin: 5px 0 0; color: #fff; font-size: 16px;">${orderData.quantity} ticket(s)</p>
        </div>
      </div>

      <div style="border-top: 1px dashed #444; margin: 20px 0; padding-top: 20px;">
        <div style="margin-bottom: 10px;">
          <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase;">Attendee</p>
          <p style="margin: 5px 0 0; color: #fff; font-size: 16px;">${orderData.customer_name}</p>
        </div>
      </div>

      <!-- QR Code - Inline SVG, no canvas needed -->
      <div style="text-align: center; margin-top: 30px; padding: 20px; background: #fff; border-radius: 12px;">
        ${qrCodeSvg}
        <p style="margin: 10px 0 0; color: #333; font-size: 12px;">Scan at entry</p>
      </div>
    </div>

    <!-- Order Summary -->
    <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
      <h3 style="margin: 0 0 15px; color: #fff; font-size: 16px;">Order Summary</h3>
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span style="color: #888;">${orderData.ticket_type} Ticket × ${orderData.quantity}</span>
        <span style="color: #fff;">$${(orderData.unit_price * orderData.quantity).toFixed(2)}</span>
      </div>
      <div style="border-top: 1px solid #333; margin-top: 15px; padding-top: 15px; display: flex; justify-content: space-between;">
        <span style="color: #fff; font-weight: bold;">Total</span>
        <span style="color: #d4af37; font-weight: bold; font-size: 18px;">$${orderData.total_amount.toFixed(2)}</span>
      </div>
    </div>

    <!-- Venue Info -->
    <div style="text-align: center; padding: 20px; border: 1px solid #333; border-radius: 12px; margin-bottom: 30px;">
      <p style="margin: 0; color: #888; font-size: 12px; text-transform: uppercase;">Venue</p>
      <p style="margin: 10px 0 0; color: #fff; font-size: 16px; font-weight: bold;">The New Yorker Hotel</p>
      <p style="margin: 5px 0 0; color: #888;">481 8th Ave, New York, NY</p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 20px 0; border-top: 1px solid #333;">
      <p style="margin: 0; color: #888; font-size: 12px;">
        Please present this email or QR code at entry.
      </p>
      <p style="margin: 10px 0 0; color: #666; font-size: 11px;">
        © 34th St Card Show. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "34th St Card Show <tickets@the34thstcardshow.com>",
      to: [orderData.customer_email],
      subject: `Your Ticket Confirmation - ${orderData.event_name}`,
      html: emailHtml,
    });

    if (emailError) {
      console.log("[SEND-TICKET-EMAIL] Email send failed");
      throw new Error("Failed to send email");
    }

    console.log("[SEND-TICKET-EMAIL] Email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log("[SEND-TICKET-EMAIL] ERROR occurred");
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
