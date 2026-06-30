import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Signing in…" }] }),
  component: AuthCallback,
});

function AuthCallback() {
  const nav = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function finishLogin() {
      // supabase-js automatically detects ?code= or #access_token= in the
      // current URL (detectSessionInUrl: true) and exchanges it for a
      // session on client init. We just need to wait for that exchange
      // to resolve, then check the result.
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      if (data.session) {
        nav({ to: "/dashboard" });
        return;
      }

      // No session yet — the exchange may still be in flight (PKCE code
      // exchange is async). Listen for the SIGNED_IN event as a fallback.
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (!mounted) return;
          if (event === "SIGNED_IN" && session) {
            subscription.unsubscribe();
            nav({ to: "/dashboard" });
          }
        }
      );

      // Final fallback: if nothing resolves within a few seconds, send the
      // user back to /auth instead of leaving them stuck on a blank page.
      const timeout = setTimeout(() => {
        if (mounted) {
          subscription.unsubscribe();
          setErrorMsg("Sign-in took too long. Please try again.");
        }
      }, 8000);

      return () => {
        clearTimeout(timeout);
        subscription.unsubscribe();
      };
    }

    finishLogin();
    return () => { mounted = false; };
  }, [nav]);

  if (errorMsg) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4">
        <div className="text-center max-w-sm">
          <p className="text-sm text-destructive">{errorMsg}</p>
          <a href="/auth" className="mt-4 inline-block text-sm text-gold hover:underline">
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="h-7 w-7 text-gold animate-spin" />
        <p className="text-sm">Completing sign-in…</p>
      </div>
    </div>
  );
}
