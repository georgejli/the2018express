/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
    console.error("[SYNC-VENDORS] OAuth token error");
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
  const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
  const getResponse = await fetch(getUrl, {
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (!getResponse.ok) {
    console.error("[SYNC-VENDORS] Error getting spreadsheet");
    throw new Error("Failed to get spreadsheet info");
  }

  const spreadsheet = await getResponse.json();
  const existingSheets = spreadsheet.sheets?.map((s: { properties: { title: string } }) => s.properties.title) || [];

  if (!existingSheets.includes(sheetName)) {
    console.log("[SYNC-VENDORS] Creating new sheet:", sheetName);
    
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
      console.error("[SYNC-VENDORS] Error creating sheet");
      throw new Error("Failed to create sheet");
    }

    // Add headers to the new sheet
    const headers = [
      "ID",
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
      "Status",
      "Has Paid",
      "Amount Paid",
      "Payment Notes",
    ];

    const headerUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(sheetName)}'!A1:Q1?valueInputOption=USER_ENTERED`;
    await fetch(headerUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [headers],
      }),
    });
  }
}

// Clear sheet data (except headers) and write fresh data
async function writeSheetData(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  rows: string[][]
): Promise<void> {
  // Clear existing data (keep headers)
  const clearUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(sheetName)}'!A2:Q1000:clear`;
  await fetch(clearUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  });

  if (rows.length === 0) {
    console.log("[SYNC-VENDORS] No data to write for sheet:", sheetName);
    return;
  }

  // Write new data
  const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'${encodeURIComponent(sheetName)}'!A2:Q${rows.length + 1}?valueInputOption=USER_ENTERED`;
  const writeResponse = await fetch(writeUrl, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      values: rows,
    }),
  });

  if (!writeResponse.ok) {
    console.error("[SYNC-VENDORS] Error writing data");
    throw new Error("Failed to write data to sheet");
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[SYNC-VENDORS] Starting sync to Google Sheets");

    const GOOGLE_SERVICE_ACCOUNT_JSON = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    const GOOGLE_SHEET_ID = Deno.env.get("GOOGLE_SHEET_ID");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!GOOGLE_SERVICE_ACCOUNT_JSON || !GOOGLE_SHEET_ID) {
      console.error("[SYNC-VENDORS] Missing Google Sheets configuration");
      throw new Error("Server configuration error");
    }

    let credentials: ServiceAccountCredentials;
    try {
      credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch {
      console.error("[SYNC-VENDORS] Invalid service account JSON");
      throw new Error("Invalid service account configuration");
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get OAuth2 access token
    console.log("[SYNC-VENDORS] Getting OAuth access token");
    const accessToken = await getAccessToken(credentials);

    // Fetch all vendor applications from Supabase
    const { data: applications, error: fetchError } = await supabase
      .from("vendor_applications")
      .select("*")
      .order("event_date", { ascending: true })
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("[SYNC-VENDORS] Error fetching applications");
      throw new Error("Failed to fetch applications");
    }

    console.log(`[SYNC-VENDORS] Found ${applications?.length || 0} applications`);

    // Group applications by event date
    const applicationsByEvent = new Map<string, typeof applications>();
    for (const app of applications || []) {
      const existing = applicationsByEvent.get(app.event_date) || [];
      existing.push(app);
      applicationsByEvent.set(app.event_date, existing);
    }

    // Sync each event's applications to its own sheet
    for (const [eventDate, eventApps] of applicationsByEvent) {
      await ensureSheetWithHeaders(accessToken, GOOGLE_SHEET_ID, eventDate);

      const rows = eventApps.map((app) => [
        app.id,
        new Date(app.created_at).toLocaleString("en-US", { timeZone: "America/New_York" }),
        app.event_date,
        app.name,
        app.email,
        app.phone,
        app.table_tier_label,
        app.table_quantity.toString(),
        app.vendor_count.toString(),
        `$${app.price_per_table}`,
        `$${app.total_price}`,
        app.merchandise_description,
        app.special_requests || "",
        app.status,
        app.has_paid ? "Yes" : "No",
        `$${app.amount_paid}`,
        app.payment_notes || "",
      ]);

      await writeSheetData(accessToken, GOOGLE_SHEET_ID, eventDate, rows);
      console.log(`[SYNC-VENDORS] Synced ${rows.length} applications for ${eventDate}`);
    }

    // Update synced_at timestamp for all synced applications
    const applicationIds = applications?.map((a) => a.id) || [];
    if (applicationIds.length > 0) {
      await supabase
        .from("vendor_applications")
        .update({ synced_to_sheets_at: new Date().toISOString() })
        .in("id", applicationIds);
    }

    console.log("[SYNC-VENDORS] Sync completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Sync completed",
        applicationsSynced: applications?.length || 0,
        eventsProcessed: applicationsByEvent.size,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[SYNC-VENDORS] Error during sync:", errorMessage);
    return new Response(
      JSON.stringify({ error: "Sync failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
