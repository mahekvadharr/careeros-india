import { createFileRoute, Outlet, useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { getProfile } from "@/lib/profile.functions";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Loader2, User } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const nav = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = useState(false);
  const hasSession = useRef(false);
  const didInitialCheck = useRef(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!mounted) return;
      if (!sess.session) {
        if (!hasSession.current) nav({ to: "/auth" });
        return;
      }
      hasSession.current = true;
      const expiresAt = (sess.session.expires_at ?? 0) * 1000;
      if (expiresAt - Date.now() < 60_000) await supabase.auth.refreshSession();
      if (mounted && !didInitialCheck.current) {
        didInitialCheck.current = true;
        setReady(true);
      }
    };
    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT") {
        hasSession.current = false;
        didInitialCheck.current = false;
        setReady(false);
        nav({ to: "/auth" });
      }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
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
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 text-gold animate-spin" />
          <p className="text-xs text-muted-foreground">Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (pathname === "/onboarding") return <Outlet />;

  const profile = data?.profile;
  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-14 flex items-center gap-3 border-b border-border/40 px-4 backdrop-blur-xl bg-background/70 sticky top-0 z-30">
            <SidebarTrigger className="shrink-0" />
            {/* Page breadcrumb */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground hidden sm:block truncate">
                CareerOS · {profile?.target_career ?? "Engineering"}
              </p>
            </div>
            {/* User avatar/name */}
            <Link to="/profile" className="flex items-center gap-2 rounded-lg hover:bg-accent px-2 py-1.5 transition-colors shrink-0">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 grid place-items-center">
                <span className="text-primary text-xs font-bold">
                  {firstName ? firstName.charAt(0).toUpperCase() : <User className="h-3 w-3" />}
                </span>
              </div>
              {firstName && (
                <span className="text-sm font-medium hidden sm:block">{firstName}</span>
              )}
            </Link>
          </header>
          <main className="flex-1 min-w-0 overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
