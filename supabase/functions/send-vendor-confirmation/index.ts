import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VendorEmailData {
  name: string;
  email: string;
  eventDate: string;
  tableTier: string;
  tableTierLabel: string;
  tableQuantity: number;
  vendorCount: number;
  totalPrice: number;
  merchandiseDescription: string;
  specialRequests?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("[VENDOR-CONFIRMATION] Missing RESEND_API_KEY");
      throw new Error("Email service not configured");
    }

    const resend = new Resend(resendApiKey);
    const data: VendorEmailData = await req.json();

    console.log("[VENDOR-CONFIRMATION] Sending confirmation to:", data.email);

    // Format the price
    const formattedPrice = `$${data.totalPrice.toLocaleString()}`;

    // Build the HTML email
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vendor Application Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #333;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #b8860b 0%, #daa520 50%, #b8860b 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #0a0a0a; font-size: 28px; font-weight: bold; letter-spacing: 1px;">
                THE 34TH CARD SHOW
              </h1>
              <p style="margin: 10px 0 0 0; color: #0a0a0a; font-size: 14px; opacity: 0.9;">
                Vendor Application Received
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #daa520; font-size: 22px;">
                Thank You, ${data.name}!
              </h2>
              
              <p style="margin: 0 0 25px 0; color: #e0e0e0; font-size: 16px; line-height: 1.6;">
                We've received your vendor application for <strong style="color: #daa520;">${data.eventDate}</strong>. Our team will review your application and get back to you shortly.
              </p>
              
              <!-- Application Summary -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #252525; border-radius: 8px; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 15px 0; color: #daa520; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">
                      Application Summary
                    </h3>
                    
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; color: #999; font-size: 14px; width: 40%;">Table Location:</td>
                        <td style="padding: 8px 0; color: #e0e0e0; font-size: 14px;">${data.tableTierLabel}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #999; font-size: 14px;">Number of Tables:</td>
                        <td style="padding: 8px 0; color: #e0e0e0; font-size: 14px;">${data.tableQuantity}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #999; font-size: 14px;">Vendor Badges:</td>
                        <td style="padding: 8px 0; color: #e0e0e0; font-size: 14px;">${data.vendorCount}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #999; font-size: 14px;">Total Amount:</td>
                        <td style="padding: 8px 0; color: #daa520; font-size: 16px; font-weight: bold;">${formattedPrice}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Merchandise Description -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #252525; border-radius: 8px; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 10px 0; color: #daa520; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                      Your Merchandise
                    </h3>
                    <p style="margin: 0; color: #e0e0e0; font-size: 14px; line-height: 1.5;">
                      ${data.merchandiseDescription}
                    </p>
                  </td>
                </tr>
              </table>
              
              ${data.specialRequests ? `
              <!-- Special Requests -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #252525; border-radius: 8px; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 10px 0; color: #daa520; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                      Special Requests
                    </h3>
                    <p style="margin: 0; color: #e0e0e0; font-size: 14px; line-height: 1.5;">
                      ${data.specialRequests}
                    </p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- Next Steps -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-left: 3px solid #daa520; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 15px 20px;">
                    <h3 style="margin: 0 0 10px 0; color: #daa520; font-size: 16px;">
                      What's Next?
                    </h3>
                    <ol style="margin: 0; padding-left: 20px; color: #e0e0e0; font-size: 14px; line-height: 1.8;">
                      <li>Our team will review your application</li>
                      <li>You'll receive an approval email within 2-3 business days</li>
                      <li>Once approved, you'll receive payment instructions</li>
                      <li>After payment, your table(s) will be reserved</li>
                    </ol>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0; color: #999; font-size: 14px; line-height: 1.6;">
                If you have any questions, please reply to this email or contact us directly.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #151515; padding: 25px 40px; border-top: 1px solid #333;">
              <p style="margin: 0 0 10px 0; color: #daa520; font-size: 14px; font-weight: bold; text-align: center;">
                The 34th Card Show
              </p>
              <p style="margin: 0; color: #666; font-size: 12px; text-align: center;">
                This is an automated confirmation. Please do not reply directly to this email.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: "The 34th Card Show <noreply@the34thcardshow.com>",
      to: [data.email],
      subject: `Vendor Application Received - ${data.eventDate}`,
      html: emailHtml,
    });

    console.log("[VENDOR-CONFIRMATION] Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[VENDOR-CONFIRMATION] Error sending email:", errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
