import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ScanLine,
  Clock,
  Bell,
  User,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/inventory", icon: Package, label: "Inventory" },
  { path: "/scan", icon: ScanLine, label: "Scan" },
  { path: "/alerts", icon: Bell, label: "Alerts" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

          const isScan = item.path === "/scan";

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                isScan ? "-mt-6" : ""
              } ${isActive && !isScan ? "text-blue-800" : "text-gray-400"}`}
            >
              {/* scan button special */}
              {isScan ? (
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                    isActive
                      ? "bg-gradient-to-r from-blue-400 via-blue-600 to-blue-900 text-white scale-105"
                      : "bg-gradient-to-r from-blue-400 via-blue-600 to-blue-900 text-white"
                  }`}
                >
                  <ScanLine className="h-6 w-6" />
                </div>
              ) : (
                <item.icon
                  className={`h-5 w-5 ${
                    isActive ? "stroke-[2.5px]" : ""
                  }`}
                />
              )}

              <span
                className={`text-[10px] font-medium ${
                  isActive && !isScan ? "font-semibold" : ""
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* safe area */}
      <div className="h-6 bg-white" />
    </nav>
  );
}