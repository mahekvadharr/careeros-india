import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, Compass, Calendar, FileText, Briefcase, MessageCircle, Mic, Wrench, Target, Settings, LogOut, Gauge, Sparkles, ChevronRight, User } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProfile } from "@/lib/profile.functions";

const MAIN_ITEMS = [
  { title: "Dashboard",       url: "/dashboard", icon: Home },
  { title: "Career GPS",      url: "/roadmap",   icon: Compass },
  { title: "Weekly Mission",  url: "/weekly",    icon: Calendar },
  { title: "Resume Analyzer", url: "/resume",    icon: FileText },
  { title: "Skill Gap",       url: "/skillgap",  icon: Target },
  { title: "Readiness",       url: "/readiness", icon: Gauge },
  { title: "AI Mentor",       url: "/mentor",    icon: MessageCircle },
  { title: "Profile",          url: "/profile",   icon: User },
];

const SOON_ITEMS = [
  { title: "Mock Interviews",    url: "/interviews",  icon: Mic },
  { title: "Project Generator",  url: "/projects",    icon: Wrench },
  { title: "Internship Tracker", url: "/internships", icon: Briefcase },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const nav = useNavigate();
  const profileFn = useServerFn(getProfile);
  const { data: profileData } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileFn(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const profile = profileData?.profile;
  const initials = (profile?.full_name ?? "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  async function signOut() {
    await supabase.auth.signOut();
    nav({ to: "/" });
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border/60 px-4 py-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-amber-700 shadow-gold shrink-0 grid place-items-center">
            <span className="text-primary-foreground font-bold text-xs">C</span>
          </div>
          {!collapsed && (
            <div>
              <div className="font-display text-base font-bold tracking-tight leading-tight">CareerOS</div>
              <div className="text-[10px] text-muted-foreground tracking-wider uppercase">India</div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/50 px-2 mb-1">Workspace</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {MAIN_ITEMS.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link
                        to={item.url}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                          active
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        }`}
                      >
                        <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : ""}`} />
                        {!collapsed && <span className="flex-1">{item.title}</span>}
                        {!collapsed && active && <ChevronRight className="h-3 w-3 text-primary/60" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-4">
          {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/50 px-2 mb-1">Coming soon</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {SOON_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground/35 cursor-not-allowed">
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.title}</span>
                        <span className="text-[9px] uppercase tracking-widest text-primary/50 bg-primary/5 px-1.5 py-0.5 rounded">Soon</span>
                      </>
                    )}
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 px-2 py-3">
        {/* Upgrade CTA */}
        {!collapsed && (
          <div className="mx-1 mb-3 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">Upgrade to Pro</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">Unlimited AI, mock interviews & more</p>
            <Link to="/pricing" className="mt-2 block text-center text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground rounded-lg py-1.5 hover:bg-primary/90 transition-colors">
              Go Pro →
            </Link>
          </div>
        )}

        <SidebarMenu className="space-y-0.5">
          {/* Profile link */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/profile"}>
              <Link to="/profile" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${pathname === "/profile" ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary/30 to-indigo-500/20 border border-primary/20 grid place-items-center shrink-0">
                  <span className="text-[9px] font-bold text-primary">{initials}</span>
                </div>
                {!collapsed && <span className="flex-1 font-medium">{profile?.full_name?.split(" ")[0] ?? "Profile"}</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <Settings className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer w-full">
                <LogOut className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Sign out</span>}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
