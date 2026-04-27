import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  Users,
  Activity,
  FileText,
  BarChart,
  BookOpen,
  Megaphone,
  LayoutDashboard,
  ChevronDown,
  Building2,
  Stethoscope,
  Server,
  Settings,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type MenuKey =
  | "dashboard"
  | "organization"
  | "hospital"
  | "bhu"
  | "clinic"
  | "pharmacy"
  | "account-roles"
  | "global-reports"
  | "system-monitoring"
  | "audit-logs"
  | "activity-timeline"
  | "ai-monitoring"
  | "my-queue"
  | "referrals"
  | "patient-records"
  | "teleconsultations"
  | "reports"
  | "cpd-modules"
  | "announcements"
  | "settings";

export default function DashboardLayout() {
  const [expandedMenu, setExpandedMenu] = useState<
    "organization" | "system-monitoring" | null
  >(null);
  const [selectedMenu, setSelectedMenu] = useState<MenuKey>("dashboard");
  const isOrgExpanded = expandedMenu === "organization";
  const isSysMonExpanded = expandedMenu === "system-monitoring";

  const toggleMenu = (menu: "organization" | "system-monitoring") => {
    setSelectedMenu(menu);
    setExpandedMenu((currentMenu) => (currentMenu === menu ? null : menu));
  };

  const menuItemClass = (menu: MenuKey, isActive = selectedMenu === menu) =>
    `flex items-center px-3 py-2 rounded-lg font-medium transition-colors ${
      isActive
        ? "bg-blue-100 text-blue-800 shadow-sm ring-1 ring-blue-200"
        : "text-neutral-600 hover:bg-neutral-100"
    }`;

  const submenuItemClass = (menu: MenuKey) =>
    `flex items-center pl-10 pr-3 py-2 rounded-lg text-sm transition-colors ${
      selectedMenu === menu
        ? "bg-blue-100 text-blue-800 font-medium shadow-sm ring-1 ring-blue-200"
        : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
    }`;

  // Retrieve user data from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  // Check if role is super_admin
  const isSuperAdmin =
    user?.role === "super_admin" || user?.role === "SUPER_ADMIN";

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden font-sans text-sm">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-50 border-r border-neutral-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold mr-3 text-base">
            AM
          </div>
          <span className="font-bold text-base text-neutral-900 tracking-tight">
            AiMedicare
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            <li>
              <a
                href="#"
                onClick={() => setSelectedMenu("dashboard")}
                className={menuItemClass("dashboard")}
              >
                <LayoutDashboard className="w-4 h-4 mr-3" />
                Dashboard
              </a>
            </li>

            {isSuperAdmin ? (
              <>
                {/* Super Admin specific navigation */}
                <li>
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => toggleMenu("organization")}
                      className={`${menuItemClass("organization")} w-full justify-between relative`}
                    >
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-3" />
                        Organization
                      </div>
                      <ChevronDown
                        className={`w-3 h-3 transition-transform duration-200 ${isOrgExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOrgExpanded && (
                      <ul className="space-y-1 mt-1">
                        <li>
                          <a
                            href="#"
                            onClick={() => setSelectedMenu("hospital")}
                            className={submenuItemClass("hospital")}
                          >
                            Hospital
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            onClick={() => setSelectedMenu("bhu")}
                            className={submenuItemClass("bhu")}
                          >
                            BHU
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            onClick={() => setSelectedMenu("clinic")}
                            className={submenuItemClass("clinic")}
                          >
                            Clinic
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            onClick={() => setSelectedMenu("pharmacy")}
                            className={submenuItemClass("pharmacy")}
                          >
                            Pharmacy
                          </a>
                        </li>
                      </ul>
                    )}
                  </div>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={() => setSelectedMenu("account-roles")}
                    className={menuItemClass("account-roles")}
                  >
                    <Users className="w-4 h-4 mr-3" />
                    Account & Roles
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={() => setSelectedMenu("global-reports")}
                    className={menuItemClass("global-reports")}
                  >
                    <BarChart className="w-4 h-4 mr-3" />
                    Global Reports
                  </a>
                </li>
                <li>
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => toggleMenu("system-monitoring")}
                      className={`${menuItemClass("system-monitoring")} w-full justify-between relative`}
                    >
                      <div className="flex items-center">
                        <Server className="w-4 h-4 mr-3" />
                        System Monitoring
                      </div>
                      <ChevronDown
                        className={`w-3 h-3 transition-transform duration-200 ${isSysMonExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isSysMonExpanded && (
                      <ul className="space-y-1 mt-1">
                        <li>
                          <a
                            href="#"
                            onClick={() => setSelectedMenu("audit-logs")}
                            className={submenuItemClass("audit-logs")}
                          >
                            Audit Logs
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            onClick={() => setSelectedMenu("activity-timeline")}
                            className={submenuItemClass("activity-timeline")}
                          >
                            Activity Timeline
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            onClick={() => setSelectedMenu("ai-monitoring")}
                            className={submenuItemClass("ai-monitoring")}
                          >
                            AI Monitoring
                          </a>
                        </li>
                      </ul>
                    )}
                  </div>
                </li>
              </>
            ) : (
              <>
                {/* Regular generic / provider navigation */}
                <li>
                  <a
                    href="#"
                    onClick={() => setSelectedMenu("my-queue")}
                    className={menuItemClass("my-queue")}
                  >
                    <CalendarDays className="w-4 h-4 mr-3" />
                    My Queue
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={() => setSelectedMenu("referrals")}
                    className={menuItemClass("referrals")}
                  >
                    <FileText className="w-4 h-4 mr-3" />
                    Referrals
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={() => setSelectedMenu("patient-records")}
                    className={menuItemClass("patient-records")}
                  >
                    <Users className="w-4 h-4 mr-3" />
                    Patient Records
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={() => setSelectedMenu("teleconsultations")}
                    className={`${menuItemClass("teleconsultations")} justify-between relative`}
                  >
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 mr-3" />
                      Teleconsultations
                    </div>
                    <ChevronDown className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    onClick={() => setSelectedMenu("reports")}
                    className={`${menuItemClass("reports")} justify-between relative`}
                  >
                    <div className="flex items-center">
                      <BarChart className="w-4 h-4 mr-3" />
                      Reports
                    </div>
                    <ChevronDown className="w-3 h-3" />
                  </a>
                </li>
              </>
            )}

            <div className="pt-4 pb-2">
              <div className="w-full h-px bg-neutral-200"></div>
            </div>

            <li>
              <a
                href="#"
                onClick={() => setSelectedMenu("cpd-modules")}
                className={menuItemClass("cpd-modules")}
              >
                <BookOpen className="w-4 h-4 mr-3" />
                CPD Modules
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={() => setSelectedMenu("announcements")}
                className={menuItemClass("announcements")}
              >
                <Megaphone className="w-4 h-4 mr-3" />
                Announcements
              </a>
            </li>
            <li>
              <a
                href="#"
                onClick={() => setSelectedMenu("settings")}
                className={menuItemClass("settings")}
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-1 flex flex-col overflow-hidden bg-neutral-50">
        {/* Top Header */}
        <header className="h-16 bg-neutral-50 flex items-center justify-between px-6 shrink-0 border-b border-neutral-200">
          <div className="flex items-center">
            {/* Search or other header components could go here */}
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-neutral-500 hover:text-neutral-700">
              <Settings className="w-6 h-6" />
            </button>
            <button className="text-neutral-500 hover:text-neutral-700 relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center space-x-2 cursor-pointer">
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://i.pravatar.cc/150?u=a04258114e29026702d" />
                <AvatarFallback>DT</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Scrollable Page Content renders here via Outlet */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
