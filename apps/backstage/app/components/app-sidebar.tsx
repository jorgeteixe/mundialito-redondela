"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Clapperboard, Image as ImageIcon, LogOut, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@mr/ui";
import { authClient } from "@/lib/auth-client";

const navItems = [
  { title: "Equipos", url: "/teams", icon: Users },
  { title: "Vídeos", url: "/videos", icon: Clapperboard },
  { title: "Imágenes", url: "/images", icon: ImageIcon },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-row items-center gap-2 px-4 py-3">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center size-6 shrink-0"
          aria-label="Toggle Sidebar"
        >
          <Image
            src="/favicon.svg"
            alt="Logo"
            width={18}
            height={18}
            loading="eager"
          />
        </button>
        <span className="font-semibold text-sm">Backstage</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
