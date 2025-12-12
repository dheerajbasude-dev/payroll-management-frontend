import React, { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// shadcn UI
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

// Local Sidebar Menu Component
import SidebarMenu from "./SidebarMenu";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const [dark, setDark] = useState(false);

  // ------------------------------
  // Load saved theme on mount
  // ------------------------------
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";

    setDark(isDark);

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // ------------------------------
  // Toggle & persist theme
  // ------------------------------
  const toggleDark = () => {
    const newTheme = !dark ? "dark" : "light";
    setDark(!dark);

    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* LEFT SECTION */}
        <div className="flex items-center gap-4">

          {/* Mobile Hamburger — uses asChild to prevent nested button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-xl dark:text-white"
              >
                ☰
              </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-64 p-6 dark:bg-gray-900">
              <SidebarMenu mobile />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link
            to="/"
            className="text-lg sm:text-xl font-semibold tracking-tight hover:text-blue-600 dark:hover:text-blue-400 dark:text-white"
          >
            Payroll Management
          </Link>
        </div>

        {/* RIGHT SECTION — Desktop Only */}
        <div className="hidden md:flex items-center gap-6">

          <Link className="nav-link dark:text-gray-200" to="/employees">
            Employees
          </Link>

          <Link className="nav-link dark:text-gray-200" to="/payrolls">
            Payrolls
          </Link>

          <Link className="nav-link dark:text-gray-200" to="/summary">
            Summary
          </Link>

          {/* Dark Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              Dark
            </span>
            <Switch checked={dark} onCheckedChange={toggleDark} />
          </div>

          {/* USER DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer border dark:border-gray-700">
                <AvatarFallback>
                  {user?.username?.[0]?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-48 dark:bg-gray-900 dark:text-gray-200"
            >
              <DropdownMenuItem disabled className="opacity-100 font-medium">
                Admin panel
                <br />
                <span className="text-gray-500 text-xs">
                  {user?.username || "Admin"}
                </span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={logout}
                className="text-red-600 dark:text-red-400"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </nav>
  );
}
