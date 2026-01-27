/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VendorApplication {
  name: string;
  email: string;
  phone: string;
  instagramHandle?: string;
  eventId: string;
  tableTier: string;
  tableTierLabel: string;
  tableQuantity: number;
  vendorCount: number;
  merchandiseDescription: string;
  specialRequests?: string;
  pricePerTable: number;
  totalPrice: number;
  eventDate: string;
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 submissions per hour per IP

// Input validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d]{10}$/;

// Validation function for vendor application
function validateApplication(application: VendorApplication): { valid: boolean; error?: string } {
  // Required fields check
  if (!application.name || !application.email || !application.phone || 
      !application.tableTier || !application.eventDate || !application.eventId) {
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
  const validTiers = ["main_ballroom", "crystal_room", "2nd_floor"];
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

  // Instagram handle validation (optional)
  if (application.instagramHandle && application.instagramHandle.length > 30) {
    return { valid: false, error: "Instagram handle must be less than 30 characters" };
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
    rateLimitMap.set(ipHash, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  entry.count++;
  return true;
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

    // Initialize Supabase client with service role for insert
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert into vendor_applications table
    const { data: insertedApplication, error: insertError } = await supabase
      .from("vendor_applications")
      .insert({
        event_id: application.eventId,
        event_date: application.eventDate,
        name: application.name.trim(),
        email: application.email.trim().toLowerCase(),
        phone: application.phone.trim(),
        instagram_handle: application.instagramHandle?.trim() || null,
        table_tier: application.tableTier,
        table_tier_label: application.tableTierLabel,
        table_quantity: application.tableQuantity,
        vendor_count: application.vendorCount,
        price_per_table: application.pricePerTable,
        total_price: application.totalPrice,
        merchandise_description: application.merchandiseDescription.trim(),
        special_requests: application.specialRequests?.trim() || null,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("[VENDOR-APPLICATION] Error inserting to database:", insertError.message);
      throw new Error("Failed to save application");
    }

    console.log("[VENDOR-APPLICATION] Successfully saved to database");

    // Send confirmation email (fire and forget - don't block the response)
    const supabaseFunctionsUrl = Deno.env.get("SUPABASE_URL")!.replace('.supabase.co', '.functions.supabase.co');
    fetch(`${supabaseFunctionsUrl}/send-vendor-confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        name: application.name.trim(),
        email: application.email.trim().toLowerCase(),
        instagramHandle: application.instagramHandle?.trim() || null,
        eventDate: application.eventDate,
        tableTier: application.tableTier,
        tableTierLabel: application.tableTierLabel,
        tableQuantity: application.tableQuantity,
        vendorCount: application.vendorCount,
        totalPrice: application.totalPrice,
        merchandiseDescription: application.merchandiseDescription.trim(),
        specialRequests: application.specialRequests?.trim() || null,
      }),
    }).then((res) => {
      if (!res.ok) {
        console.error("[VENDOR-APPLICATION] Failed to send confirmation email");
      } else {
        console.log("[VENDOR-APPLICATION] Confirmation email triggered");
      }
    }).catch((err) => {
      console.error("[VENDOR-APPLICATION] Error triggering confirmation email:", err.message);
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Application submitted successfully",
        id: insertedApplication.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[VENDOR-APPLICATION] Error processing application:", errorMessage);
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