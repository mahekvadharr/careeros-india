import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Map, Calendar, FileText, Briefcase, MessageCircle, Mic, Settings, LogOut } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";

const items = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Career Roadmap", url: "/roadmap", icon: Map },
  { title: "Weekly Tasks", url: "/weekly", icon: Calendar },
  { title: "AI Mentor", url: "/mentor", icon: MessageCircle },
  { title: "Resume Review", url: "/resume", icon: FileText, soon: true },
  { title: "Mock Interviews", url: "/interviews", icon: Mic, soon: true },
  { title: "Internship Hub", url: "/internships", icon: Briefcase, soon: true },
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border/60">
        <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-amber-700 shadow-gold shrink-0" />
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-display text-lg">CareerOS</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">India</div>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Workspace</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} disabled={item.soon}>
                      {item.soon ? (
                        <div className="flex items-center gap-2 opacity-50 cursor-not-allowed">
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span className="flex items-center gap-2">{item.title}<span className="text-[9px] uppercase tracking-widest text-gold/70">Soon</span></span>}
                        </div>
                      ) : (
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </Link>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/60">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/settings" className="flex items-center gap-2"><Settings className="h-4 w-4" />{!collapsed && <span>Settings</span>}</Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut}>
              <LogOut className="h-4 w-4" />{!collapsed && <span>Sign out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
