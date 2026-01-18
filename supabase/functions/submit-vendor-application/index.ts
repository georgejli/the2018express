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
  eventDate: string; // Format: "February 15, 2026"
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

// Check if a sheet exists and create it if not, then add headers
async function ensureSheetWithHeaders(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string
): Promise<void> {
  // First, get the spreadsheet to check existing sheets
  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
  const getResponse = await fetch(getUrl, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (!getResponse.ok) {
    const errorText = await getResponse.text();
    console.error("Error getting spreadsheet:", errorText);
    throw new Error("Failed to get spreadsheet info");
  }

  const spreadsheet = await getResponse.json();
  const existingSheets = spreadsheet.sheets?.map((s: { properties: { title: string } }) => s.properties.title) || [];
  
  console.log("Existing sheets:", existingSheets);
  console.log("Looking for sheet:", sheetName);

  // If sheet doesn't exist, create it
  if (!existingSheets.includes(sheetName)) {
    console.log(`Creating new sheet: ${sheetName}`);
    
    const createSheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
    const createResponse = await fetch(createSheetUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          },
        ],
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("Error creating sheet:", errorText);
      throw new Error("Failed to create sheet");
    }

    console.log(`Sheet "${sheetName}" created successfully`);

    // Add headers to the new sheet
    const headers = [
      "Submitted At",
      "Event Date",
      "Name",
      "Email",
      "Phone",
      "Table Location",
      "# of Tables",
      "# of Vendors",
      "Price Per Table",
      "Total Price",
      "Merchandise Description",
      "Special Requests",
    ];

    const headerUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(sheetName)}'!A1:L1?valueInputOption=USER_ENTERED`;
    const headerResponse = await fetch(headerUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [headers],
      }),
    });

    if (!headerResponse.ok) {
      const errorText = await headerResponse.text();
      console.error("Error adding headers:", errorText);
      // Don't throw - headers are nice to have but not critical
    } else {
      console.log("Headers added successfully");
    }
  }
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
      eventDate: application.eventDate,
    });

    // Validate required fields
    if (
      !application.name ||
      !application.email ||
      !application.phone ||
      !application.tableTier ||
      !application.eventDate
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

    // Use the event date as the sheet name (e.g., "February 15, 2026")
    const sheetName = application.eventDate;
    
    // Ensure the sheet exists with headers
    await ensureSheetWithHeaders(accessToken, GOOGLE_SHEET_ID, sheetName);

    // Prepare the row data for Google Sheets
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    
    const rowData = [
      timestamp,
      application.eventDate,
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

    // Append data to the event-specific sheet
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/'${encodeURIComponent(sheetName)}'!A:L:append?valueInputOption=USER_ENTERED`;

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
