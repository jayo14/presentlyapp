import * as React from "react"
import { cn } from "./utils"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    collapsible?: "icon" | "offcanvas" | "none"
  }
>(({ className, collapsible = "icon", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-screen w-full flex-col border-r bg-surface",
      className
    )}
    {...props}
  />
))
Sidebar.displayName = "Sidebar"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-auto px-2 py-4", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-between border-b px-4 py-6", className)}
    {...props}
  />
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("border-t px-4 py-4", className)}
    {...props}
  />
))
SidebarFooter.displayName = "SidebarFooter"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul ref={ref} className={cn("flex flex-col gap-1", className)} {...props} />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  icon?: React.ReactNode
  tooltip?: string
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, isActive, icon, tooltip, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
      isActive
        ? "bg-primary text-on-primary-fixed shadow-md"
        : "text-on-surface/70 hover:text-on-surface hover:bg-surface-container/50",
      className
    )}
    title={tooltip}
    {...props}
  >
    {icon && <span className="flex-shrink-0">{icon}</span>}
    {children && <span className="flex-1 text-left truncate">{children}</span>}
  </button>
))
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("ml-4 border-l border-outline px-2 py-2 flex flex-col gap-1", className)}
    {...props}
  />
))
SidebarMenuSub.displayName = "SidebarMenuSub"

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

const SidebarMenuSubButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, isActive, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
      isActive
        ? "bg-primary/20 text-primary"
        : "text-on-surface/60 hover:text-on-surface hover:bg-surface-container/30",
      className
    )}
    {...props}
  />
))
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

const SidebarSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("my-2 h-px bg-outline", className)}
    {...props}
  />
))
SidebarSeparator.displayName = "SidebarSeparator"

export {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
}
