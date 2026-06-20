// Edge Function: media moderation (spec §11). Runs on every image upload BEFORE
// it goes live; posts stay moderation_status='pending' until cleared. Hybrid,
// risk-tiered pipeline — mandatory from day one, not optional.
//
// Tier 1 (auto-block, zero tolerance): CSAM / terrorism / known illegal.
//   PhotoDNA hash match + Hive/Thorn "Safer" AI. Auto-block, no appeal, and
//   FILE THE LEGALLY REQUIRED NCMEC REPORT (US law).
// Tier 2 (human review queue): graphic violence, harassment, doxxing,
//   possible deepfakes → AWS Rekognition flags → moderator queue.
// Tier 3 (auto-handle + log): borderline NSFW → block/age-gate, log for audit.
//
// Secrets (Edge only): AWS_REKOGNITION_*, HIVE_API_KEY, PHOTODNA_*, NCMEC_*.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Verdict = "approved" | "blocked" | "review";

Deno.serve(async (req: Request) => {
  const { postId, imageUrl } = (await req.json()) as { postId: string; imageUrl: string };

  // TIER 1 — known-CSAM hash + AI (PhotoDNA + Hive/Thorn Safer).
  if (await isKnownIllegal(imageUrl)) {
    await fileNcmecReport(postId, imageUrl); // legally required (spec §11)
    return finalize(postId, "blocked");
  }

  // TIER 2 — AWS Rekognition for violence/explicit; route flags to humans.
  const labels = await rekognitionModeration(imageUrl);
  if (labels.some((l) => l.severity === "high")) return finalize(postId, "review");

  // TIER 3 — borderline NSFW: block or age-gate per policy, log for audit.
  if (labels.some((l) => l.severity === "medium")) return finalize(postId, "review");

  return finalize(postId, "approved");
});

async function finalize(postId: string, verdict: Verdict) {
  const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const status = verdict === "approved" ? "approved" : "blocked"; // 'review' stays blocked from public until a moderator clears it
  await supa.from("posts").update({ moderation_status: status }).eq("id", postId);
  return new Response(JSON.stringify({ verdict }), { headers: { "content-type": "application/json" } });
}

// --- integrations (wire to real services with Edge secrets) -----------------
async function isKnownIllegal(_imageUrl: string): Promise<boolean> {
  // TODO: PhotoDNA hash match + Hive/Thorn Safer. Returns true → auto-block.
  return false;
}
async function fileNcmecReport(_postId: string, _imageUrl: string): Promise<void> {
  // TODO: submit the legally required report to NCMEC. Non-negotiable.
}
async function rekognitionModeration(
  _imageUrl: string,
): Promise<{ name: string; severity: "low" | "medium" | "high" }[]> {
  // TODO: AWS Rekognition DetectModerationLabels → map confidence to severity.
  return [];
}
