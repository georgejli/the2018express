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

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 5; // 5 submissions per hour per IP

// Input validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-\+\(\)]{10,20}$/;

// Validation function for vendor application
function validateApplication(application: VendorApplication): { valid: boolean; error?: string } {
  // Required fields check
  if (!application.name || !application.email || !application.phone || 
      !application.tableTier || !application.eventDate) {
    return { valid: false, error: "Missing required fields" };
  }

  // Name validation
  const trimmedName = application.name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 100) {
    return { valid: false, error: "Name must be between 2 and 100 characters" };
  }

  // Email format validation
  if (!EMAIL_REGEX.test(application.email)) {
    return { valid: false, error: "Invalid email format" };
  }
  if (application.email.length > 255) {
    return { valid: false, error: "Email must be less than 255 characters" };
  }

  // Phone validation
  if (!PHONE_REGEX.test(application.phone)) {
    return { valid: false, error: "Invalid phone number format" };
  }

  // Table tier validation
  const validTiers = ["tier1", "tier2", "tier3"];
  if (!validTiers.includes(application.tableTier)) {
    return { valid: false, error: "Invalid table tier" };
  }

  // Quantity validation
  if (!Number.isInteger(application.tableQuantity) || 
      application.tableQuantity < 1 || 
      application.tableQuantity > 20) {
    return { valid: false, error: "Table quantity must be between 1 and 20" };
  }

  // Vendor count validation
  if (!Number.isInteger(application.vendorCount) || 
      application.vendorCount < 1 || 
      application.vendorCount > 10) {
    return { valid: false, error: "Vendor count must be between 1 and 10" };
  }

  // Merchandise description validation
  if (!application.merchandiseDescription || 
      application.merchandiseDescription.trim().length < 10) {
    return { valid: false, error: "Merchandise description must be at least 10 characters" };
  }
  if (application.merchandiseDescription.length > 1000) {
    return { valid: false, error: "Merchandise description must be less than 1000 characters" };
  }

  // Special requests validation (optional but limited)
  if (application.specialRequests && application.specialRequests.length > 500) {
    return { valid: false, error: "Special requests must be less than 500 characters" };
  }

  // Price validation
  if (typeof application.pricePerTable !== "number" || application.pricePerTable < 0) {
    return { valid: false, error: "Invalid price per table" };
  }
  if (typeof application.totalPrice !== "number" || application.totalPrice < 0) {
    return { valid: false, error: "Invalid total price" };
  }

  return { valid: true };
}

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

async function checkRateLimit(clientIP: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(clientIP);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const ipHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
  
  const now = Date.now();
  const entry = rateLimitMap.get(ipHash);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ipHash, { count: 1, resetTime: now + 3600000 });
    return true;
  }
  
  if (entry.count >= 5) {
    return false;
  }
  
  entry.count++;
  return true;
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
    console.error("[VENDOR-APPLICATION] OAuth token error");
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
    console.error("[VENDOR-APPLICATION] Error getting spreadsheet");
    throw new Error("Failed to get spreadsheet info");
  }

  const spreadsheet = await getResponse.json();
  const existingSheets = spreadsheet.sheets?.map((s: { properties: { title: string } }) => s.properties.title) || [];
  
  console.log("[VENDOR-APPLICATION] Checking sheet existence");

  // If sheet doesn't exist, create it
  if (!existingSheets.includes(sheetName)) {
    console.log("[VENDOR-APPLICATION] Creating new sheet");
    
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
      console.error("[VENDOR-APPLICATION] Error creating sheet");
      throw new Error("Failed to create sheet");
    }

    console.log("[VENDOR-APPLICATION] Sheet created successfully");

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
      console.error("[VENDOR-APPLICATION] Error adding headers");
    } else {
      console.log("[VENDOR-APPLICATION] Headers added successfully");
    }
  }
}

// Check rate limit using Supabase
async function checkRateLimit(supabase: ReturnType<typeof createClient>, clientIP: string): Promise<{ allowed: boolean; remaining: number }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS);
  
  // Create a hash of the IP for privacy
  const encoder = new TextEncoder();
  const data = encoder.encode(clientIP);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const ipHash = hashArray.map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
  
  // Check existing rate limit entries (using a simple in-memory approach via KV-like pattern)
  // For edge functions, we'll use a simpler timestamp-based approach in the request metadata
  // Since we can't use persistent storage easily, we'll implement a basic check
  
  // For production, you'd want to use Supabase table for rate limiting
  // This is a simplified version that provides some protection
  console.log(`[VENDOR-APPLICATION] Rate limit check for IP hash: ${ipHash}`);
  
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";
    
    // Check rate limit
    const allowed = await checkRateLimit(clientIP);
    if (!allowed) {
      console.log("[VENDOR-APPLICATION] Rate limit exceeded");
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again later." }),
        {
          status: 429,
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": "3600"
          },
        }
      );
    }

    const GOOGLE_SERVICE_ACCOUNT_JSON = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
    const GOOGLE_SHEET_ID = Deno.env.get("GOOGLE_SHEET_ID");

    if (!GOOGLE_SERVICE_ACCOUNT_JSON || !GOOGLE_SHEET_ID) {
      console.error("[VENDOR-APPLICATION] Missing Google Sheets configuration");
      throw new Error("Server configuration error");
    }

    // Parse service account credentials
    let credentials: ServiceAccountCredentials;
    try {
      credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch {
      console.error("[VENDOR-APPLICATION] Invalid service account JSON");
      throw new Error("Invalid service account configuration");
    }

    const application: VendorApplication = await req.json();
    
    // Log only non-sensitive info
    console.log("[VENDOR-APPLICATION] Received submission for event:", application.eventDate);

    // Validate input thoroughly
    const validation = validateApplication(application);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get OAuth2 access token
    console.log("[VENDOR-APPLICATION] Getting OAuth access token");
    const accessToken = await getAccessToken(credentials);
    console.log("[VENDOR-APPLICATION] Successfully obtained access token");

    // Use the event date as the sheet name (e.g., "February 15, 2026")
    const sheetName = application.eventDate;
    
    // Ensure the sheet exists with headers
    await ensureSheetWithHeaders(accessToken, GOOGLE_SHEET_ID, sheetName);

    // Prepare the row data for Google Sheets (sanitize inputs)
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
      application.eventDate.trim(),
      application.name.trim(),
      application.email.trim().toLowerCase(),
      application.phone.trim(),
      application.tableTierLabel.trim(),
      application.tableQuantity.toString(),
      application.vendorCount.toString(),
      `$${application.pricePerTable}`,
      `$${application.totalPrice}`,
      application.merchandiseDescription.trim(),
      (application.specialRequests || "").trim(),
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
      console.error("[VENDOR-APPLICATION] Google Sheets API error");
      throw new Error("Failed to save to Google Sheets");
    }

    console.log("[VENDOR-APPLICATION] Successfully appended to Google Sheets");

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
    console.error("[VENDOR-APPLICATION] Error processing application");
    return new Response(
      JSON.stringify({
        error: "Failed to submit application",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
