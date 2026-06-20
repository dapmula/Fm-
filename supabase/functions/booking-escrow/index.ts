// Edge Function: booking escrow (spec §8). ALL money logic + the Stripe secret
// key live here, never in the app (spec §2/§17). This replicates escrow with
// Stripe Connect separate charges + transfers and manual payouts: funds are
// HELD by the platform and only released on approval.
//
// Deploy: supabase functions deploy booking-escrow
// Secrets: supabase secrets set STRIPE_SECRET_KEY=... STRIPE_WEBHOOK_SECRET=...
//
// Real Stripe wiring is intentionally left as TODOs — get legal review of the
// Connect agreement, ToS, and refund policy before launch (spec §8 warning).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { canTransition } from "../_shared/booking.ts";

type Action = "fund" | "deliver" | "request_revision" | "approve" | "dispute" | "refund";

const FM_FEE_RATE = 0.15;

Deno.serve(async (req: Request) => {
  const { bookingId, action } = (await req.json()) as { bookingId: string; action: Action };

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // service role bypasses RLS for state moves
  );

  const { data: booking, error } = await supa.from("bookings").select("*").eq("id", bookingId).single();
  if (error || !booking) return json({ error: "booking not found" }, 404);

  switch (action) {
    case "fund": {
      // TODO(stripe): create a PaymentIntent with application_fee_amount and
      // capture funds to the PLATFORM balance (not transferred yet → escrow).
      return move(supa, booking, "funded");
    }
    case "deliver":
      return move(supa, booking, "delivered");
    case "request_revision": {
      if (booking.revisions_used >= booking.revisions_allowed) {
        return json({ error: "no revisions remaining — open a dispute" }, 400);
      }
      await supa.from("bookings").update({ revisions_used: booking.revisions_used + 1 }).eq("id", bookingId);
      return move(supa, booking, "revision");
    }
    case "approve": {
      // TODO(stripe): create a Transfer of (amount - 15% fee) to the artist's
      // connected account, then release. This is the escrow RELEASE.
      const fee = Math.round(booking.amount_cents * FM_FEE_RATE);
      void fee;
      return move(supa, booking, "completed");
    }
    case "dispute":
      return move(supa, booking, "disputed");
    case "refund": {
      // TODO(stripe): refund the PaymentIntent back to the client.
      return move(supa, booking, "refunded");
    }
    default:
      return json({ error: "unknown action" }, 400);
  }
});

async function move(supa: any, booking: any, to: string) {
  if (!canTransition(booking.status, to as any)) {
    return json({ error: `illegal transition ${booking.status} → ${to}` }, 409);
  }
  await supa.from("bookings").update({ status: to }).eq("id", booking.id);
  return json({ ok: true, status: to });
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
