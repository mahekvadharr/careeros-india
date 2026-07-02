import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, Compass, Calendar, FileText, Briefcase, MessageCircle, Mic, Wrench, Target, Settings, LogOut, Gauge, Sparkles, ChevronRight } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";

const MAIN_ITEMS = [
  { title: "Dashboard",       url: "/dashboard", icon: Home },
  { title: "Career GPS",      url: "/roadmap",   icon: Compass },
  { title: "Weekly Mission",  url: "/weekly",    icon: Calendar },
  { title: "Resume Analyzer", url: "/resume",    icon: FileText },
  { title: "Skill Gap",       url: "/skillgap",  icon: Target },
  { title: "Readiness",       url: "/readiness", icon: Gauge },
  { title: "AI Mentor",       url: "/mentor",    icon: MessageCircle },
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

      <SidebarFooter className="border-t border-sidebar-border/60 px-2 py-3 space-y-0.5">
        {!collapsed && (
          <div className="mx-1 mb-2 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 p-3">
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
        <SidebarMenu>
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
