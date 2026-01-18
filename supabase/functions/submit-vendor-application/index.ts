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

interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
}

// Create JWT for Google API authentication
async function createJWT(credentials: ServiceAccountCredentials): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  const encoder = new TextEncoder();
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import the private key
  const pemContents = credentials.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");
  
  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${unsignedToken}.${signatureB64}`;
}

// Get OAuth2 access token using service account
async function getAccessToken(credentials: ServiceAccountCredentials): Promise<string> {
  const jwt = await createJWT(credentials);
  
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OAuth token error:", errorText);
    throw new Error("Failed to get OAuth access token");
  }

  const data = await response.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_SERVICE_ACCOUNT_JSON = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    const GOOGLE_SHEET_ID = Deno.env.get("GOOGLE_SHEET_ID");

    if (!GOOGLE_SERVICE_ACCOUNT_JSON || !GOOGLE_SHEET_ID) {
      console.error("Missing Google Sheets configuration");
      throw new Error("Server configuration error");
    }

    // Parse service account credentials
    let credentials: ServiceAccountCredentials;
    try {
      credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch {
      console.error("Invalid service account JSON");
      throw new Error("Invalid service account configuration");
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

    // Get OAuth2 access token
    console.log("Getting OAuth access token...");
    const accessToken = await getAccessToken(credentials);
    console.log("Successfully obtained access token");

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

    // Append data to Google Sheet using the Sheets API with OAuth2
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/Sheet1!A:K:append?valueInputOption=USER_ENTERED`;

    const sheetsResponse = await fetch(appendUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
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
