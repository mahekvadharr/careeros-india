import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Signing in…" }] }),
  component: AuthCallback,
});

function AuthCallback() {
  const nav = useNavigate();

  useEffect(() => {
    // Supabase writes the session from the URL hash/code automatically via
    // onAuthStateChange. We just wait for it and redirect.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          subscription.unsubscribe();
          nav({ to: "/dashboard" });
        } else if (event === "SIGNED_OUT") {
          subscription.unsubscribe();
          nav({ to: "/auth" });
        }
      }
    );

    // Fallback: if a session already exists (e.g. page refreshed mid-flow)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        subscription.unsubscribe();
        nav({ to: "/dashboard" });
      }
    });

    return () => subscription.unsubscribe();
  }, [nav]);

  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="h-7 w-7 text-gold animate-spin" />
        <p className="text-sm">Completing sign-in…</p>
      </div>
    </div>
  );
}
