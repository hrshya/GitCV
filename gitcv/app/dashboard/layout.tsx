import { cn } from "@/lib/utils";
import { Geist } from "next/font/google";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <SidebarProvider className="bg-[#EEF2FF]"
            style={
                {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
            >
            <AppSidebar variant="inset" />
            <SidebarInset className="p-4 bg-white">
                {children}
            </SidebarInset>
        </SidebarProvider>
  );
}
