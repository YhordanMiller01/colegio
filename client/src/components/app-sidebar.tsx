import { 
  BarChart3, 
  CalendarCheck, 
  Star, 
  Bell, 
  Vote, 
  Users, 
  GraduationCap 
} from "lucide-react";
import { useLocation } from "wouter";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
  },
  {
    title: "Asistencia",
    url: "/attendance",
    icon: CalendarCheck,
  },
  {
    title: "Comportamiento",
    url: "/behavior",
    icon: Star,
  },
  {
    title: "Notificaciones",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Encuestas",
    url: "/surveys",
    icon: Vote,
  },
  {
    title: "Estudiantes",
    url: "/students",
    icon: Users,
  },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="text-primary-foreground h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">DisciColeControl</h2>
              <p className="text-sm text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Gestión Escolar</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-${item.title.toLowerCase()}`}
                  >
                    <button onClick={() => setLocation(item.url)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
