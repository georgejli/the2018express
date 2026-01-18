/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VendorApplication {
  name: string;
  email: string;
  phone: string;
  tableTier: string;
  tableTierLabel: string;
  tableQuantity: number;
  vendorCount: number;
  merchandiseDescription: string;
  specialRequests?: string;
  pricePerTable: number;
  totalPrice: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_SHEETS_API_KEY = Deno.env.get("GOOGLE_SHEETS_API_KEY");
    const GOOGLE_SHEET_ID = Deno.env.get("GOOGLE_SHEET_ID");

    if (!GOOGLE_SHEETS_API_KEY || !GOOGLE_SHEET_ID) {
      console.error("Missing Google Sheets configuration");
      throw new Error("Server configuration error");
    }

    const application: VendorApplication = await req.json();
    console.log("Received vendor application:", {
      name: application.name,
      email: application.email,
      tableTier: application.tableTierLabel,
    });

    // Validate required fields
    if (
      !application.name ||
      !application.email ||
      !application.phone ||
      !application.tableTier
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Prepare the row data for Google Sheets
    const timestamp = new Date().toISOString();
    const rowData = [
      timestamp,
      application.name,
      application.email,
      application.phone,
      application.tableTierLabel,
      application.tableQuantity.toString(),
      application.vendorCount.toString(),
      `$${application.pricePerTable}`,
      `$${application.totalPrice}`,
      application.merchandiseDescription,
      application.specialRequests || "",
    ];

    // Append data to Google Sheet using the Sheets API
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Sheet1!A:K:append?valueInputOption=USER_ENTERED&key=${GOOGLE_SHEETS_API_KEY}`;

    const sheetsResponse = await fetch(appendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [rowData],
      }),
    });

    if (!sheetsResponse.ok) {
      const errorText = await sheetsResponse.text();
      console.error("Google Sheets API error:", errorText);
      throw new Error("Failed to save to Google Sheets");
    }

    const result = await sheetsResponse.json();
    console.log("Successfully appended to Google Sheets:", result.updates);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Application submitted successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error processing vendor application:", errorMessage);
    return new Response(
      JSON.stringify({
        error: "Failed to submit application",
        details: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
