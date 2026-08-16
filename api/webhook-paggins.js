// Vercel Serverless Function: Paggins Webhook Handler
// URL: https://your-domain.vercel.app/api/webhook-paggins

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Supabase Connection
const SUPABASE_URL = process.env.SUPABASE_URL || "https://okztuqmwssuiopkuxzrr.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Paggins API & Webhook Secrets (Configured in Vercel Environment Variables)
const PAGGINS_SECRET_KEY = process.env.PAGGINS_SECRET_KEY || "";
const PAGGINS_WEBHOOK_SECRET = process.env.PAGGINS_WEBHOOK_SECRET || "";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Mapping keywords / product slugs from Paggins to internal Module IDs
const MODULE_MAPPING = {
  main: "a-aramaic-code",
  aramaic: "a-aramaic-code",
  prayer: "a-aramaic-code",
  miracle: "a-miracle-generator",
  generator: "a-miracle-generator",
  jewish: "a-jewish-secret-ritual",
  ritual: "a-jewish-secret-ritual",
  polyglot: "a-polyglot-sleep",
  sleep: "a-polyglot-sleep",
  covenant: "a-covenant-hour",
  hour: "a-covenant-hour"
};

function detectModulesFromPayload(body) {
  const modules = new Set(["a-aramaic-code"]); // Default Front-End access

  const textToScan = JSON.stringify(body || {}).toLowerCase();

  // The Miracle Generator
  if (
    textToScan.includes("f9fd8789-9006-4e38-b655-da31ce8bf128") ||
    textToScan.includes("miracle") ||
    textToScan.includes("generator")
  ) {
    modules.add("a-miracle-generator");
  }

  // The Jewish Secret Ritual
  if (
    textToScan.includes("3054f780-aeb9-4ee7-963f-417f0255653b") ||
    textToScan.includes("jewish") ||
    textToScan.includes("ritual")
  ) {
    modules.add("a-jewish-secret-ritual");
  }

  // The Polyglot Sleep
  if (
    textToScan.includes("7e9aea7e-12af-467b-9c57-f239ad5b54f0") ||
    textToScan.includes("polyglot") ||
    textToScan.includes("sleep")
  ) {
    modules.add("a-polyglot-sleep");
  }

  // The Covenant Hour
  if (
    textToScan.includes("62267a39-b804-4ac0-810a-c1af386549b9") ||
    textToScan.includes("covenant") ||
    textToScan.includes("conevant")
  ) {
    modules.add("a-covenant-hour");
  }

  return Array.from(modules);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const payload = req.body || {};
    console.log("[paggins-webhook] Received event:", JSON.stringify(payload));

    // Extract email and buyer info from standard Paggins webhook structure
    const email = String(
      payload.customer?.email ||
      payload.email ||
      payload.data?.customer?.email ||
      payload.data?.email ||
      payload.buyer?.email ||
      ""
    ).trim().toLowerCase();

    const name = String(
      payload.customer?.name ||
      payload.name ||
      payload.data?.customer?.name ||
      payload.data?.name ||
      payload.buyer?.name ||
      ""
    ).trim();

    const status = String(
      payload.status ||
      payload.event ||
      payload.data?.status ||
      "paid"
    ).toLowerCase();

    const transactionId = String(
      payload.id ||
      payload.transaction_id ||
      payload.data?.id ||
      ""
    );

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid customer email in payload" });
    }

    // Only process approved / paid transactions
    const isPaid = /paid|approved|pago|aprovado|succeeded|completed/i.test(status);
    if (!isPaid) {
      console.log(`[paggins-webhook] Transaction status is ${status}. Skipping enrollment.`);
      return res.status(200).json({ message: `Ignored status: ${status}` });
    }

    const purchasedModules = detectModulesFromPayload(payload);

    // 1. Insert or update the authorized buyer in Supabase
    const { data: buyer, error: buyerError } = await supabaseAdmin
      .from("authorized_buyers")
      .upsert(
        {
          email,
          name: name || email.split("@")[0],
          purchased_modules: purchasedModules,
          transaction_id: transactionId,
          status: "paid",
          updated_at: new Date().toISOString()
        },
        { onConflict: "email" }
      )
      .select()
      .single();

    if (buyerError) {
      console.error("[paggins-webhook] Failed to save authorized buyer:", buyerError);
      return res.status(500).json({ error: "Database save failed", details: buyerError });
    }

    // 2. If the user is already registered in Supabase auth, grant module access in real time
    const { data: userProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (userProfile && userProfile.id) {
      const accessRows = purchasedModules.map((moduleId) => ({
        user_id: userProfile.id,
        module_id: moduleId
      }));

      await supabaseAdmin
        .from("module_access")
        .upsert(accessRows, { onConflict: "user_id,module_id" });

      console.log(`[paggins-webhook] Instant access granted to existing user ${email}:`, purchasedModules);
    }

    return res.status(200).json({
      ok: true,
      message: `Buyer ${email} successfully authorized`,
      modules: purchasedModules
    });
  } catch (err) {
    console.error("[paggins-webhook] Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error", message: err.message });
  }
}
