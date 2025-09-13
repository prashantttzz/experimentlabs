"use client";

import { useState } from "react";
import {
  Home,
  Map,
  BarChart2,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"; 
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const mainMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "My Journey", url: "#", icon: Map },
  { title: "Analytics", url: "#", icon: BarChart2 },
  { title: "Profile", url: "#", icon: User },
];


export function AppSidebar() {
  const router = useRouter();
  const logout =()=>{
    localStorage.removeItem("authToken")
    router.push("/")
  }
  const [activeItem, setActiveItem] = useState("Dashboard");

  return (
    <Sidebar className="border-r border-gray-200 bg-white text-gray-800">
      <SidebarHeader>
        <SidebarContent>
          <div className="flex items-center space-x-3 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Achievo</h1>
          </div>
        </SidebarContent>
      </SidebarHeader>

      <SidebarContent className="flex-grow">
        <SidebarMenu>
          {mainMenuItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <a
                href={item.url}
                onClick={() => setActiveItem(item.title)}
                className={cn(
                  "flex items-center space-x-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  activeItem === item.title
                    ? "bg-green-100 text-green-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </a>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <div className="px-4 my-4">
          <div className="h-px bg-gray-200" />
        </div>
      </SidebarContent>

      <SidebarFooter>
        <div className="space-y-4 p-4 border-t border-gray-200">
          <div className="flex items-center sp  ace-x-3 w-full pl-5">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              onClick={logout}
              >
              Logout
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
