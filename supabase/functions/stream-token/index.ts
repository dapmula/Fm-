// Edge Function: mint a Stream Chat user token (spec §7). The STREAM_API_SECRET
// never touches the app — only the public key ships client-side, the token is
// signed here.
//
// Secret: supabase secrets set STREAM_API_SECRET=...

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  const authHeader = req.headers.get("Authorization") ?? "";
  const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user } } = await supa.auth.getUser();
  if (!user) return new Response("unauthorized", { status: 401 });

  // TODO(stream): const token = StreamChat.getInstance(apiKey, secret).createToken(user.id);
  const token = "TODO-signed-with-STREAM_API_SECRET";

  return new Response(JSON.stringify({ userId: user.id, token }), {
    headers: { "content-type": "application/json" },
  });
});
