import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { getProfile } from "@/lib/profile.functions";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = useState(false);

  // Track whether we've already confirmed a session, so repeated
  // onAuthStateChange firings (e.g. TOKEN_REFRESHED, duplicate SIGNED_IN)
  // can't flip `ready` back and forth and cause remounts/refetch loops.
  const hasSession = useRef(false);
  const didInitialCheck = useRef(false);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!sess.session) {
        if (!hasSession.current) {
          // Only redirect if we never had a session this mount —
          // avoids bouncing the user mid-refresh.
          nav({ to: "/auth" });
        }
        return;
      }

      hasSession.current = true;
      const expiresAt = (sess.session.expires_at ?? 0) * 1000;
      if (expiresAt - Date.now() < 60_000) {
        await supabase.auth.refreshSession();
      }
      if (mounted && !didInitialCheck.current) {
        didInitialCheck.current = true;
        setReady(true);
      }
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      // Only react to an actual sign-out. Ignore TOKEN_REFRESHED,
      // INITIAL_SESSION, and duplicate SIGNED_IN events entirely —
      // they don't require any state change here and were causing
      // this layout (and everything under it) to re-render in a loop.
      if (event === "SIGNED_OUT") {
        hasSession.current = false;
        didInitialCheck.current = false;
        setReady(false);
        nav({ to: "/auth" });
      }
    });

    return () => { mounted = false; subscription.unsubscribe(); };
    // Intentionally empty deps — this should run once per mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = useServerFn(getProfile);
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => fetchProfile(),
    enabled: ready,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (!ready || isLoading) return;
    const profile = data?.profile;
    if (profile && !profile.onboarded && pathname !== "/onboarding") {
      nav({ to: "/onboarding" });
    }
  }, [ready, isLoading, data, pathname, nav]);

  if (!ready || isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="h-6 w-6 text-gold animate-spin" />
      </div>
    );
  }

  // Onboarding page: render without sidebar
  if (pathname === "/onboarding") return <Outlet />;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border/40 px-4 backdrop-blur-xl bg-background/60 sticky top-0 z-30">
            <SidebarTrigger />
            <div className="ml-auto text-xs text-muted-foreground">CareerOS · {data?.profile?.target_career ?? "Engineering"}</div>
          </header>
          <main className="flex-1 min-w-0"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}
