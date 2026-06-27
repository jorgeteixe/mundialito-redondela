"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  CalendarRange,
  Clapperboard,
  Image as ImageIcon,
  LogOut,
  Send,
  Swords,
  Trophy,
  UserCog,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@mr/ui";
import { authClient } from "@/lib/auth-client";
import type { Category } from "@/lib/category";

// One section per category, each repeating the category-scoped items.
const scopedSections: { label: string; category: Category }[] = [
  { label: "Senior", category: "senior" },
  { label: "Cadete", category: "cadet" },
];

const scopedItems = [
  { title: "Equipos", path: "teams", icon: Users },
  { title: "Grupos F1", path: "groups/f1", icon: Trophy },
  { title: "Grupos F2", path: "groups/f2", icon: Trophy },
  { title: "Eliminatorias", path: "eliminatorias", icon: Swords },
  { title: "Calendario", path: "calendario", icon: CalendarDays },
];

// General items that apply across all categories.
const generalNavItems = [
  { title: "Calendario", url: "/calendario", icon: CalendarRange },
];

// Social-media items, grouped under "Redes sociales".
const socialNavItems = [
  { title: "Vídeos", url: "/videos", icon: Clapperboard },
  { title: "Imágenes", url: "/images", icon: ImageIcon },
  { title: "Publicaciones", url: "/publicaciones", icon: Send },
];

export function AppSidebar({ canManageUsers }: { canManageUsers: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toggleSidebar } = useSidebar();

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/login");
  }

  function renderItem(item: {
    title: string;
    url: string;
    icon: typeof Users;
  }) {
    return (
      <SidebarMenuItem key={item.url}>
        <SidebarMenuButton
          asChild
          isActive={
            pathname === item.url || pathname.startsWith(`${item.url}/`)
          }
        >
          <Link href={item.url}>
            <item.icon />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
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
        {scopedSections.map((section) => (
          <SidebarGroup key={section.category}>
            <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {scopedItems
                  .map((item) => ({
                    title: item.title,
                    url: `/${section.category}/${item.path}`,
                    icon: item.icon,
                  }))
                  .map(renderItem)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[
                ...generalNavItems,
                ...(canManageUsers
                  ? [{ title: "Usuarios", url: "/users", icon: UserCog }]
                  : []),
              ].map(renderItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Redes sociales</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{socialNavItems.map(renderItem)}</SidebarMenu>
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
