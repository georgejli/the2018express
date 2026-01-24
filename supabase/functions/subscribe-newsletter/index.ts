import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
  source?: "website" | "checkout";
}

// Simple email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, source = "website" }: SubscribeRequest = await req.json();

    // Validate email
    if (!email || !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Please provide a valid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Initialize Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if already subscribed (either from newsletter or checkout)
    const { data: existingSubscriber } = await supabase
      .from("newsletter_subscribers")
      .select("id, is_active, source")
      .eq("email", normalizedEmail)
      .maybeSingle();

    // Also check if they've already subscribed via ticket checkout
    const { data: checkoutSubscriber } = await supabase
      .from("ticket_orders")
      .select("id, customer_email")
      .eq("customer_email", normalizedEmail)
      .eq("subscribe_to_updates", true)
      .eq("status", "completed")
      .limit(1)
      .maybeSingle();

    // If already subscribed, just return success (no duplicate email)
    if (existingSubscriber?.is_active) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "You're already subscribed!",
          alreadySubscribed: true 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // If they subscribed via checkout but not in newsletter table, add them without sending email
    if (checkoutSubscriber && !existingSubscriber) {
      const { error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email: normalizedEmail,
          source: "checkout",
          is_active: true,
        });

      if (insertError && !insertError.message.includes("duplicate")) {
        throw insertError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "You're already subscribed via your ticket purchase!",
          alreadySubscribed: true 
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // If previously unsubscribed, reactivate
    if (existingSubscriber && !existingSubscriber.is_active) {
      const { error: updateError } = await supabase
        .from("newsletter_subscribers")
        .update({ 
          is_active: true, 
          unsubscribed_at: null,
          subscribed_at: new Date().toISOString()
        })
        .eq("id", existingSubscriber.id);

      if (updateError) throw updateError;

      // Send welcome back email
      await sendWelcomeEmail(normalizedEmail, true);

      return new Response(
        JSON.stringify({ success: true, message: "Welcome back! You've been resubscribed." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // New subscriber - insert and send welcome email
    const { error: insertError } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email: normalizedEmail,
        source,
        is_active: true,
      });

    if (insertError) {
      if (insertError.message.includes("duplicate")) {
        return new Response(
          JSON.stringify({ success: true, message: "You're already subscribed!", alreadySubscribed: true }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      throw insertError;
    }

    // Send welcome email (only for new website signups, not checkout)
    if (source === "website") {
      await sendWelcomeEmail(normalizedEmail, false);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Thanks for subscribing!" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Newsletter subscription error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to subscribe. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

async function sendWelcomeEmail(email: string, isResubscribe: boolean): Promise<void> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY not configured, skipping welcome email");
    return;
  }

  const resend = new Resend(resendApiKey);

  try {
    await resend.emails.send({
      from: "34th St Card Show <noreply@the34thcardshow.com>",
      to: [email],
      subject: isResubscribe 
        ? "Welcome Back to the 34th St Card Show!" 
        : "Welcome to the 34th St Card Show Newsletter!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f0f23; font-family: Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f0f23; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a2e; border-radius: 16px; overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #0f0f23; font-size: 28px; font-weight: bold;">
                        ${isResubscribe ? "Welcome Back!" : "You're In!"}
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #ffffff; font-size: 18px; margin: 0 0 20px 0;">
                        ${isResubscribe 
                          ? "Great to have you back! You're now resubscribed to the 34th St Card Show newsletter."
                          : "Thanks for subscribing to the 34th St Card Show newsletter!"}
                      </p>
                      
                      <p style="color: #a0a0b0; font-size: 16px; margin: 0 0 30px 0; line-height: 1.6;">
                        You'll be the first to know about:
                      </p>
                      
                      <ul style="color: #a0a0b0; font-size: 16px; margin: 0 0 30px 0; padding-left: 20px; line-height: 1.8;">
                        <li style="margin-bottom: 10px;">📅 Upcoming show dates</li>
                        <li style="margin-bottom: 10px;">⭐ Special guest announcements</li>
                        <li style="margin-bottom: 10px;">🎫 Early bird ticket access</li>
                        <li style="margin-bottom: 10px;">🏆 Exclusive collector news</li>
                      </ul>
                      
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="https://the34thcardshow.lovable.app" 
                               style="display: inline-block; background: linear-gradient(135deg, #d4af37 0%, #f4d03f 100%); color: #0f0f23; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                              View Upcoming Shows
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #16162a; padding: 25px 30px; border-top: 1px solid #2a2a4a;">
                      <p style="color: #666680; font-size: 12px; margin: 0; text-align: center; line-height: 1.6;">
                        34th St Card Show • The New Yorker Hotel • 481 8th Ave, New York, NY<br>
                        <a href="https://the34thcardshow.lovable.app" style="color: #d4af37; text-decoration: none;">the34thcardshow.lovable.app</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
    console.log("Welcome email sent to:", email);
  } catch (emailError) {
    console.error("Failed to send welcome email:", emailError);
    // Don't throw - subscription succeeded even if email fails
  }
}

serve(handler);
