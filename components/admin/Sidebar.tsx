"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  ChevronDown,
  ChevronRight,
  UtensilsCrossed,
  BookOpen,
  FlaskConical,
  ClipboardList,
} from "lucide-react";

type NavItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string; icon: React.ReactNode }[];
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Order",
    href: "/admin/orders",
    icon: <ShoppingCart size={18} />,
  },
  {
    label: "Products",
    icon: <Package size={18} />,
    children: [
      {
        label: "Item",
        href: "/admin/products/items",
        icon: <UtensilsCrossed size={16} />,
      },
      {
        label: "Recipe",
        href: "/admin/products/recipes",
        icon: <BookOpen size={16} />,
      },
    ],
  },
  {
    label: "Inventory",
    icon: <Warehouse size={18} />,
    children: [
      {
        label: "Ingredients",
        href: "/admin/inventory/ingredients",
        icon: <FlaskConical size={16} />,
      },
      {
        label: "Stock Opname",
        href: "/admin/inventory/stock-opname",
        icon: <ClipboardList size={16} />,
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Products: true,
    Inventory: true,
  });

  function toggleMenu(label: string) {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-56 shrink-0 bg-gray-900 text-gray-100 flex flex-col min-h-screen">
      <div className="px-5 py-5 border-b border-gray-700">
        <span className="text-lg font-bold tracking-tight">Admin Panel</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          if (item.children) {
            const isOpen = openMenus[item.label] ?? false;
            const anyChildActive = item.children.some((c) => isActive(c.href));
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    anyChildActive
                      ? "bg-gray-700 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {item.icon}
                    {item.label}
                  </span>
                  {isOpen ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
                {isOpen && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                          isActive(child.href)
                            ? "bg-indigo-600 text-white"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                        }`}
                      >
                        {child.icon}
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(item.href!)
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
