import React from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { LucideIcon } from "lucide-react";

interface SidebarProps {
  className?: string;
  children?: React.ReactNode;
}

export function Sidebar({ className, children }: SidebarProps) {
  return (
    <div
      className={cn(
        "h-screen flex flex-col border-r bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}

interface SidebarHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

export function SidebarHeader({ className, children }: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        "h-14 flex items-center px-4 border-b border-sidebar-border",
        className
      )}
    >
      {children}
    </div>
  );
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarNav({ className, children, ...props }: SidebarNavProps) {
  return (
    <div className={cn("flex-1 overflow-auto", className)} {...props}>
      <nav className="grid gap-1 px-2 py-3">{children}</nav>
    </div>
  );
}

interface SidebarNavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  href: string;
  icon?: LucideIcon;
  active?: boolean;
}

export function SidebarNavItem({
  href,
  icon: Icon,
  children,
  className,
  ...props
}: SidebarNavItemProps) {
  const [location, navigate] = useLocation();
  const isActive = location === href;

  const handleNavigation = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <div
      onClick={handleNavigation}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </div>
  );
}

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarFooter({
  className,
  children,
  ...props
}: SidebarFooterProps) {
  return (
    <div
      className={cn(
        "mt-auto border-t border-sidebar-border p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
