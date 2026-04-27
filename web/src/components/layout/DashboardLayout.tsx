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
  Server
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export default function DashboardLayout() {
  const [isOrgExpanded, setIsOrgExpanded] = useState(false);
  const [isSysMonExpanded, setIsSysMonExpanded] = useState(false);

  // Retrieve user data from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  // Check if role is super_admin
  const isSuperAdmin = user?.role === "super_admin" || user?.role === "SUPER_ADMIN";

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden font-sans text-sm">
      {/* Sidebar */}
      <aside className="w-64 bg-neutral-50 border-r border-neutral-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200 shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold mr-3 text-base">
            AM
          </div>
          <span className="font-bold text-base text-neutral-900 tracking-tight">AiMedicare</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            <li>
              <a href="#" className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium transition-colors">
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
                      onClick={() => setIsOrgExpanded(!isOrgExpanded)}
                      className="w-full flex items-center justify-between px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium transition-colors relative"
                    >
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-3" />
                        Organization
                      </div>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOrgExpanded ? "rotate-180" : ""}`} />
                    </button>
                    {isOrgExpanded && (
                      <ul className="pl-10 space-y-1 mt-1">
                        <li>
                          <a href="#" className="flex items-center px-3 py-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg text-sm transition-colors">
                            Hospital
                          </a>
                        </li>
                        <li>
                          <a href="#" className="flex items-center px-3 py-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg text-sm transition-colors">
                            BHU
                          </a>
                        </li>
                        <li>
                          <a href="#" className="flex items-center px-3 py-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg text-sm transition-colors">
                            Clinic
                          </a>
                        </li>
                        <li>
                          <a href="#" className="flex items-center px-3 py-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg text-sm transition-colors">
                            Pharmacy
                          </a>
                        </li>
                      </ul>
                    )}
                  </div>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium transition-colors">
                    <Users className="w-4 h-4 mr-3" />
                    Account & Roles
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center justify-between px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium transition-colors relative">
                    <div className="flex items-center">
                      <BarChart className="w-4 h-4 mr-3" />
                      Global Reports
                    </div>
                    <ChevronDown className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <div className="flex flex-col space-y-1">
                    <button 
                      onClick={() => setIsSysMonExpanded(!isSysMonExpanded)}
                      className="w-full flex items-center justify-between px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium transition-colors relative"
                    >
                      <div className="flex items-center">
                        <Server className="w-4 h-4 mr-3" />
                        System Monitoring
                      </div>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isSysMonExpanded ? "rotate-180" : ""}`} />
                    </button>
                    {isSysMonExpanded && (
                      <ul className="pl-10 space-y-1 mt-1">
                        <li>
                          <a href="#" className="flex items-center px-3 py-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg text-sm transition-colors">
                            Audit Logs
                          </a>
                        </li>
                        <li>
                          <a href="#" className="flex items-center px-3 py-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg text-sm transition-colors">
                            Activity Timeline
                          </a>
                        </li>
                        <li>
                          <a href="#" className="flex items-center px-3 py-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg text-sm transition-colors">
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
                  <a href="#" className="flex items-center px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium transition-colors">
                    <CalendarDays className="w-4 h-4 mr-3" />
                    My Queue
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium transition-colors">
                    <FileText className="w-4 h-4 mr-3" />
                    Referrals
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium transition-colors">
                    <Users className="w-4 h-4 mr-3" />
                    Patient Records
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center justify-between px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium transition-colors relative">
                    <div className="flex items-center">
                      <Activity className="w-4 h-4 mr-3" />
                      Teleconsultations
                    </div>
                    <ChevronDown className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center justify-between px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium transition-colors relative">
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
              <a href="#" className="flex items-center px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium transition-colors">
                <BookOpen className="w-4 h-4 mr-3" />
                CPD Modules
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center px-3 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-medium transition-colors">
                <Megaphone className="w-4 h-4 mr-3" />
                Announcements
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
            <button className="text-neutral-500 hover:text-neutral-700 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
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