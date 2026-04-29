import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { toast } from "sonner";
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
  Server,
  Settings,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import {
  createBHU,
  createHospital,
  getBHUs,
  getHospitals,
  type BHUPayload,
  type BHURecord,
  type HospitalPayload,
  type HospitalRecord,
} from "../../services/api";

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

type OrganizationMenuKey = Extract<
  MenuKey,
  "hospital" | "bhu" | "clinic" | "pharmacy"
>;

type OrganizationDirectory = {
  title: string;
  description: string;
  addLabel: string;
  nameHeader: string;
  items: {
    id?: string;
    name: string;
    dzongkhag: string;
    gewog?: string;
    addressLine?: string;
    level?: string;
    contact?: string;
    status: string;
  }[];
};

const dzongkhags = [
  "Bumthang",
  "Chukha",
  "Dagana",
  "Gasa",
  "Haa",
  "Lhuentse",
  "Mongar",
  "Paro",
  "Pemagatshel",
  "Punakha",
  "Samdrup Jongkhar",
  "Samtse",
  "Sarpang",
  "Thimphu",
  "Trashigang",
  "Trashiyangtse",
  "Trongsa",
  "Tsirang",
  "Wangdue Phodrang",
  "Zhemgang",
];

const organizationTypes = [
  "National Referral Hospital",
  "Regional Referral Hospital",
  "District Hospital",
  "Traditional Medicine Hospital",
];

const gewogs = [
  { name: "Chhoekhor", dzongkhag: "Bumthang" },
  { name: "Chhume", dzongkhag: "Bumthang" },
  { name: "Tang", dzongkhag: "Bumthang" },
  { name: "Ura", dzongkhag: "Bumthang" },
  { name: "Bjachho", dzongkhag: "Chhukha" },
  { name: "Bongo", dzongkhag: "Chhukha" },
  { name: "Chapcha", dzongkhag: "Chhukha" },
  { name: "Darla", dzongkhag: "Chhukha" },
  { name: "Dungna", dzongkhag: "Chhukha" },
  { name: "Geling", dzongkhag: "Chhukha" },
  { name: "Getana", dzongkhag: "Chhukha" },
  { name: "Lokchina", dzongkhag: "Chhukha" },
  { name: "Metakha", dzongkhag: "Chhukha" },
  { name: "Phuentsholing", dzongkhag: "Chhukha" },
  { name: "Sampheling", dzongkhag: "Chhukha" },
  { name: "Dorona", dzongkhag: "Dagana" },
  { name: "Drujegang", dzongkhag: "Dagana" },
  { name: "Gesarling", dzongkhag: "Dagana" },
  { name: "Goshi", dzongkhag: "Dagana" },
  { name: "Kana", dzongkhag: "Dagana" },
  { name: "Karmaling", dzongkhag: "Dagana" },
  { name: "Khebisa", dzongkhag: "Dagana" },
  { name: "Lajab", dzongkhag: "Dagana" },
  { name: "Lhamoi Zingkha", dzongkhag: "Dagana" },
  { name: "Nichula", dzongkhag: "Dagana" },
  { name: "Trashiding", dzongkhag: "Dagana" },
  { name: "Tsangkha", dzongkhag: "Dagana" },
  { name: "Tsendagang", dzongkhag: "Dagana" },
  { name: "Tseza", dzongkhag: "Dagana" },
  { name: "Khamaed", dzongkhag: "Gasa" },
  { name: "Khatoe", dzongkhag: "Gasa" },
  { name: "Laya", dzongkhag: "Gasa" },
  { name: "Lunana", dzongkhag: "Gasa" },
  { name: "Bji", dzongkhag: "Haa" },
  { name: "Gakiling", dzongkhag: "Haa" },
  { name: "Katsho", dzongkhag: "Haa" },
  { name: "Samar", dzongkhag: "Haa" },
  { name: "Sangbay", dzongkhag: "Haa" },
  { name: "Uesu", dzongkhag: "Haa" },
  { name: "Gangzur", dzongkhag: "Lhuentse" },
  { name: "Khoma", dzongkhag: "Lhuentse" },
  { name: "Jarey", dzongkhag: "Lhuentse" },
  { name: "Kurtoed", dzongkhag: "Lhuentse" },
  { name: "Menbi", dzongkhag: "Lhuentse" },
  { name: "Metsho", dzongkhag: "Lhuentse" },
  { name: "Minjay", dzongkhag: "Lhuentse" },
  { name: "Tsenkhar", dzongkhag: "Lhuentse" },
  { name: "Balam", dzongkhag: "Mongar" },
  { name: "Chali", dzongkhag: "Mongar" },
  { name: "Chaskhar", dzongkhag: "Mongar" },
  { name: "Drametse", dzongkhag: "Mongar" },
  { name: "Drepong", dzongkhag: "Mongar" },
  { name: "Gongdue", dzongkhag: "Mongar" },
  { name: "Jurmey", dzongkhag: "Mongar" },
  { name: "Kengkhar", dzongkhag: "Mongar" },
  { name: "Mongar", dzongkhag: "Mongar" },
  { name: "Narang", dzongkhag: "Mongar" },
  { name: "Ngatshang", dzongkhag: "Mongar" },
  { name: "Saling", dzongkhag: "Mongar" },
  { name: "Shermuhoong", dzongkhag: "Mongar" },
  { name: "Silambi", dzongkhag: "Mongar" },
  { name: "Thangrong", dzongkhag: "Mongar" },
  { name: "Tsakaling", dzongkhag: "Mongar" },
  { name: "Tsamang", dzongkhag: "Mongar" },
  { name: "Dokar", dzongkhag: "Paro" },
  { name: "Dopshari", dzongkhag: "Paro" },
  { name: "Doteng", dzongkhag: "Paro" },
  { name: "Hungrel", dzongkhag: "Paro" },
  { name: "Lamgong", dzongkhag: "Paro" },
  { name: "Lungnyi", dzongkhag: "Paro" },
  { name: "Naja", dzongkhag: "Paro" },
  { name: "Shapa", dzongkhag: "Paro" },
  { name: "Tsento", dzongkhag: "Paro" },
  { name: "Wangchang", dzongkhag: "Paro" },
  { name: "Chimoong", dzongkhag: "Pema Gatshel" },
  { name: "Chokhorling", dzongkhag: "Pema Gatshel" },
  { name: "Chongshing", dzongkhag: "Pema Gatshel" },
  { name: "Dechheling", dzongkhag: "Pema Gatshel" },
  { name: "Dungmaed", dzongkhag: "Pema Gatshel" },
  { name: "Khar", dzongkhag: "Pema Gatshel" },
  { name: "Nanong", dzongkhag: "Pema Gatshel" },
  { name: "Norbugang", dzongkhag: "Pema Gatshel" },
  { name: "Shumar", dzongkhag: "Pema Gatshel" },
  { name: "Yurung", dzongkhag: "Pema Gatshel" },
  { name: "Zobel", dzongkhag: "Pema Gatshel" },
  { name: "Barp", dzongkhag: "Punakha" },
  { name: "Chhubug", dzongkhag: "Punakha" },
  { name: "Dzomi", dzongkhag: "Punakha" },
  { name: "Goenshari", dzongkhag: "Punakha" },
  { name: "Guma", dzongkhag: "Punakha" },
  { name: "Kabisa", dzongkhag: "Punakha" },
  { name: "Lingmukha", dzongkhag: "Punakha" },
  { name: "Shenga Bjemi", dzongkhag: "Punakha" },
  { name: "Talog", dzongkhag: "Punakha" },
  { name: "Toepisa", dzongkhag: "Punakha" },
  { name: "Toewang", dzongkhag: "Punakha" },
  { name: "Dewathang", dzongkhag: "Samdrup Jongkhar" },
  { name: "Gomdar", dzongkhag: "Samdrup Jongkhar" },
  { name: "Langchenphu", dzongkhag: "Samdrup Jongkhar" },
  { name: "Lauri", dzongkhag: "Samdrup Jongkhar" },
  { name: "Martshala", dzongkhag: "Samdrup Jongkhar" },
  { name: "Orong", dzongkhag: "Samdrup Jongkhar" },
  { name: "Pemathang", dzongkhag: "Samdrup Jongkhar" },
  { name: "Phuntshothang", dzongkhag: "Samdrup Jongkhar" },
  { name: "Samrang", dzongkhag: "Samdrup Jongkhar" },
  { name: "Serthi", dzongkhag: "Samdrup Jongkhar" },
  { name: "Wangphu", dzongkhag: "Samdrup Jongkhar" },
  { name: "Dungtoe", dzongkhag: "Samtse" },
  { name: "Dophoogchen", dzongkhag: "Samtse" },
  { name: "Duenchukha", dzongkhag: "Samtse" },
  { name: "Namgaychhoeling", dzongkhag: "Samtse" },
  { name: "Norbugang", dzongkhag: "Samtse" },
  { name: "Norgaygang", dzongkhag: "Samtse" },
  { name: "Pemaling", dzongkhag: "Samtse" },
  { name: "Phuentshogpelri", dzongkhag: "Samtse" },
  { name: "Samtse", dzongkhag: "Samtse" },
  { name: "Sangngagchhoeling", dzongkhag: "Samtse" },
  { name: "Tading", dzongkhag: "Samtse" },
  { name: "Tashicholing", dzongkhag: "Samtse" },
  { name: "Tendruk", dzongkhag: "Samtse" },
  { name: "Ugentse", dzongkhag: "Samtse" },
  { name: "Yoeseltse", dzongkhag: "Samtse" },
  { name: "Chhuzagang", dzongkhag: "Sarpang" },
  { name: "Chhudzom", dzongkhag: "Sarpang" },
  { name: "Dekiling", dzongkhag: "Sarpang" },
  { name: "Gakiling", dzongkhag: "Sarpang" },
  { name: "Gelephu", dzongkhag: "Sarpang" },
  { name: "Jigmechholing", dzongkhag: "Sarpang" },
  { name: "Samtenling", dzongkhag: "Sarpang" },
  { name: "Senggey", dzongkhag: "Sarpang" },
  { name: "Sherzhong", dzongkhag: "Sarpang" },
  { name: "Shompangkha", dzongkhag: "Sarpang" },
  { name: "Tareythang", dzongkhag: "Sarpang" },
  { name: "Umling", dzongkhag: "Sarpang" },
  { name: "Chang", dzongkhag: "Thimphu" },
  { name: "Darkala", dzongkhag: "Thimphu" },
  { name: "Genye", dzongkhag: "Thimphu" },
  { name: "Kawang", dzongkhag: "Thimphu" },
  { name: "Lingzhi", dzongkhag: "Thimphu" },
  { name: "Mewang", dzongkhag: "Thimphu" },
  { name: "Naro", dzongkhag: "Thimphu" },
  { name: "Soe", dzongkhag: "Thimphu" },
  { name: "Bartsham", dzongkhag: "Trashigang" },
  { name: "Bidung", dzongkhag: "Trashigang" },
  { name: "Kanglung", dzongkhag: "Trashigang" },
  { name: "Kangpar", dzongkhag: "Trashigang" },
  { name: "Khaling", dzongkhag: "Trashigang" },
  { name: "Lumang", dzongkhag: "Trashigang" },
  { name: "Merag", dzongkhag: "Trashigang" },
  { name: "Phongmed", dzongkhag: "Trashigang" },
  { name: "Radi", dzongkhag: "Trashigang" },
  { name: "Sagteng", dzongkhag: "Trashigang" },
  { name: "Samkhar", dzongkhag: "Trashigang" },
  { name: "Shongphoog", dzongkhag: "Trashigang" },
  { name: "Thrimshing", dzongkhag: "Trashigang" },
  { name: "Uzorong", dzongkhag: "Trashigang" },
  { name: "Yangnyer", dzongkhag: "Trashigang" },
  { name: "Bumdeling", dzongkhag: "Trashi Yangtse" },
  { name: "Jamkhar", dzongkhag: "Trashi Yangtse" },
  { name: "Khamdang", dzongkhag: "Trashi Yangtse" },
  { name: "Ramjar", dzongkhag: "Trashi Yangtse" },
  { name: "Toetsho", dzongkhag: "Trashi Yangtse" },
  { name: "Tomzhang", dzongkhag: "Trashi Yangtse" },
  { name: "Yalang", dzongkhag: "Trashi Yangtse" },
  { name: "Yangtse", dzongkhag: "Trashi Yangtse" },
  { name: "Dragteng", dzongkhag: "Trongsa" },
  { name: "Korphoog", dzongkhag: "Trongsa" },
  { name: "Langthil", dzongkhag: "Trongsa" },
  { name: "Nubi", dzongkhag: "Trongsa" },
  { name: "Tangsibji", dzongkhag: "Trongsa" },
  { name: "Barshong", dzongkhag: "Tsirang" },
  { name: "Dunglegang", dzongkhag: "Tsirang" },
  { name: "Gosarling", dzongkhag: "Tsirang" },
  { name: "Kikhorthang", dzongkhag: "Tsirang" },
  { name: "Mendrelgang", dzongkhag: "Tsirang" },
  { name: "Patshaling", dzongkhag: "Tsirang" },
  { name: "Phuntenchu", dzongkhag: "Tsirang" },
  { name: "Rangthangling", dzongkhag: "Tsirang" },
  { name: "Semjong", dzongkhag: "Tsirang" },
  { name: "Sergithang", dzongkhag: "Tsirang" },
  { name: "Tsholingkhar", dzongkhag: "Tsirang" },
  { name: "Tsirangtoe", dzongkhag: "Tsirang" },
  { name: "Athang", dzongkhag: "Wangdue Phodrang" },
  { name: "Bjendag", dzongkhag: "Wangdue Phodrang" },
  { name: "Darkar", dzongkhag: "Wangdue Phodrang" },
  { name: "Dangchu", dzongkhag: "Wangdue Phodrang" },
  { name: "Gangteng", dzongkhag: "Wangdue Phodrang" },
  { name: "Gasetsho Gom", dzongkhag: "Wangdue Phodrang" },
  { name: "Gasetsho Wom", dzongkhag: "Wangdue Phodrang" },
  { name: "Kazhi", dzongkhag: "Wangdue Phodrang" },
  { name: "Nahi", dzongkhag: "Wangdue Phodrang" },
  { name: "Nyisho", dzongkhag: "Wangdue Phodrang" },
  { name: "Phangyul", dzongkhag: "Wangdue Phodrang" },
  { name: "Phobji", dzongkhag: "Wangdue Phodrang" },
  { name: "Ruepisa", dzongkhag: "Wangdue Phodrang" },
  { name: "Sephu", dzongkhag: "Wangdue Phodrang" },
  { name: "Thedtsho", dzongkhag: "Wangdue Phodrang" },
  { name: "Bardo", dzongkhag: "Zhemgang" },
  { name: "Bjoka", dzongkhag: "Zhemgang" },
  { name: "Goshing", dzongkhag: "Zhemgang" },
  { name: "Nangkor", dzongkhag: "Zhemgang" },
  { name: "Ngangla", dzongkhag: "Zhemgang" },
  { name: "Phangkhar", dzongkhag: "Zhemgang" },
  { name: "Shingkhar", dzongkhag: "Zhemgang" },
  { name: "Trong", dzongkhag: "Zhemgang" },
];

const organizationDirectories: Record<
  OrganizationMenuKey,
  OrganizationDirectory
> = {
  hospital: {
    title: "Hospital Details",
    description:
      "Manage registered hospitals under the organization directory.",
    addLabel: "Add New Hospital",
    nameHeader: "Hospital Name",
    items: [
      {
        name: "Jigme Dorji Wangchuck National Referral Hospital",
        dzongkhag: "Thimphu",
        level: "National Referral",
        contact: "+975 2 322 827",
        status: "Active",
      },
      {
        name: "Gelephu Central Regional Referral Hospital",
        dzongkhag: "Sarpang",
        level: "Regional Referral",
        contact: "+975 6 251 112",
        status: "Active",
      },
      {
        name: "Mongar Regional Referral Hospital",
        dzongkhag: "Mongar",
        level: "Regional Referral",
        contact: "+975 4 641 001",
        status: "Active",
      },
      {
        name: "Phuentsholing General Hospital",
        dzongkhag: "Chukha",
        level: "General Hospital",
        contact: "+975 5 252 168",
        status: "Active",
      },
    ],
  },
  bhu: {
    title: "BHU Details",
    description:
      "Manage registered Basic Health Units under the organization directory.",
    addLabel: "Add New BHU",
    nameHeader: "BHU Name",
    items: [
      {
        name: "Changjiji BHU",
        dzongkhag: "Thimphu",
        level: "BHU I",
        contact: "+975 2 335 190",
        status: "Active",
      },
      {
        name: "Khaling BHU",
        dzongkhag: "Trashigang",
        level: "BHU I",
        contact: "+975 4 521 204",
        status: "Active",
      },
      {
        name: "Nganglam BHU",
        dzongkhag: "Pemagatshel",
        level: "BHU II",
        contact: "+975 7 481 112",
        status: "Active",
      },
      {
        name: "Lhamoizingkha BHU",
        dzongkhag: "Dagana",
        level: "BHU II",
        contact: "+975 6 471 018",
        status: "Active",
      },
    ],
  },
  clinic: {
    title: "Clinic Details",
    description: "Manage registered clinics under the organization directory.",
    addLabel: "Add New Clinic",
    nameHeader: "Clinic Name",
    items: [
      {
        name: "Norzin Family Clinic",
        dzongkhag: "Thimphu",
        level: "Private Clinic",
        contact: "+975 2 331 505",
        status: "Active",
      },
      {
        name: "Druk Health Clinic",
        dzongkhag: "Paro",
        level: "Private Clinic",
        contact: "+975 8 271 220",
        status: "Active",
      },
      {
        name: "Samdrup Medical Clinic",
        dzongkhag: "Samdrup Jongkhar",
        level: "General Clinic",
        contact: "+975 7 251 442",
        status: "Active",
      },
      {
        name: "Punakha Wellness Clinic",
        dzongkhag: "Punakha",
        level: "General Clinic",
        contact: "+975 2 584 016",
        status: "Active",
      },
    ],
  },
  pharmacy: {
    title: "Pharmacy Details",
    description:
      "Manage registered pharmacies under the organization directory.",
    addLabel: "Add New Pharmacy",
    nameHeader: "Pharmacy Name",
    items: [
      {
        name: "Kuenphen Pharmacy",
        dzongkhag: "Thimphu",
        level: "Retail Pharmacy",
        contact: "+975 2 333 919",
        status: "Active",
      },
      {
        name: "Menjong Pharmacy",
        dzongkhag: "Chukha",
        level: "Retail Pharmacy",
        contact: "+975 5 252 450",
        status: "Active",
      },
      {
        name: "Eastern Care Pharmacy",
        dzongkhag: "Mongar",
        level: "Retail Pharmacy",
        contact: "+975 4 641 219",
        status: "Active",
      },
      {
        name: "Pelkhil Pharmacy",
        dzongkhag: "Sarpang",
        level: "Retail Pharmacy",
        contact: "+975 6 251 830",
        status: "Active",
      },
    ],
  },
};

export default function DashboardLayout() {
  const [expandedMenu, setExpandedMenu] = useState<
    "organization" | "system-monitoring" | null
  >(null);
  const [selectedMenu, setSelectedMenu] = useState<MenuKey>("dashboard");
  const isOrgExpanded = expandedMenu === "organization";
  const isSysMonExpanded = expandedMenu === "system-monitoring";
  const selectedOrganizationMenu = isOrganizationMenu(selectedMenu)
    ? selectedMenu
    : null;

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
          {selectedOrganizationMenu ? (
            <OrganizationDetailsView
              organizationType={selectedOrganizationMenu}
              directory={organizationDirectories[selectedOrganizationMenu]}
            />
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  );
}

function isOrganizationMenu(menu: MenuKey): menu is OrganizationMenuKey {
  return (
    menu === "hospital" ||
    menu === "bhu" ||
    menu === "clinic" ||
    menu === "pharmacy"
  );
}

function mapHospitalToDirectoryItem(hospital: HospitalRecord) {
  return {
    id: hospital.id,
    name: hospital.name,
    dzongkhag: hospital.dzongkhag,
    level: hospital.type,
    contact: hospital.telephone,
    status: hospital.status,
  };
}

function mapBHUToDirectoryItem(bhu: BHURecord) {
  return {
    id: bhu.id,
    name: bhu.name,
    dzongkhag: bhu.dzongkhag,
    gewog: bhu.gewog,
    addressLine: bhu.addressLine,
    contact: bhu.telephone,
    status: bhu.status,
  };
}

function OrganizationDetailsView({
  organizationType,
  directory,
}: {
  organizationType: OrganizationMenuKey;
  directory: OrganizationDirectory;
}) {
  const isHospitalDirectory = organizationType === "hospital";
  const isBHUDirectory = organizationType === "bhu";
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
  const [organizationItems, setOrganizationItems] = useState(directory.items);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [typeQuery, setTypeQuery] = useState("");
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [addressLine, setAddressLine] = useState("");
  const [gewogQuery, setGewogQuery] = useState("");
  const [isGewogOpen, setIsGewogOpen] = useState(false);
  const [dzongkhagQuery, setDzongkhagQuery] = useState("");
  const [isDzongkhagOpen, setIsDzongkhagOpen] = useState(false);
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const filteredOrganizationTypes = organizationTypes.filter((type) =>
    type.toLowerCase().includes(typeQuery.toLowerCase()),
  );
  const selectedDzongkhag = dzongkhags.find(
    (dzongkhag) => dzongkhag.toLowerCase() === dzongkhagQuery.toLowerCase(),
  );
  const filteredGewogs = gewogs.filter(
    (gewog) =>
      Boolean(selectedDzongkhag) &&
      gewog.dzongkhag === selectedDzongkhag &&
      gewog.name.toLowerCase().includes(gewogQuery.toLowerCase()),
  );
  const filteredDzongkhags = dzongkhags.filter((dzongkhag) =>
    dzongkhag.toLowerCase().includes(dzongkhagQuery.toLowerCase()),
  );
  const tableItems =
    isHospitalDirectory || isBHUDirectory ? organizationItems : directory.items;

  const resetForm = () => {
    setName("");
    setTypeQuery("");
    setAddressLine("");
    setDzongkhagQuery("");
    setGewogQuery("");
    setTelephone("");
    setEmail("");
    setIsTypeOpen(false);
    setIsDzongkhagOpen(false);
    setIsGewogOpen(false);
  };

  useEffect(() => {
    if (!isHospitalDirectory) {
      setOrganizationItems(directory.items);
      return;
    }

    const loadHospitals = async () => {
      setIsLoadingOrganizations(true);
      try {
        const data = await getHospitals();
        setOrganizationItems(data.hospitals.map(mapHospitalToDirectoryItem));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load hospitals";
        toast.error(message);
      } finally {
        setIsLoadingOrganizations(false);
      }
    };

    loadHospitals();
  }, [directory.items, isHospitalDirectory]);

  useEffect(() => {
    if (!isBHUDirectory) {
      return;
    }

    const loadBHUs = async () => {
      setIsLoadingOrganizations(true);
      try {
        const data = await getBHUs();
        setOrganizationItems(data.bhus.map(mapBHUToDirectoryItem));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load BHUs";
        toast.error(message);
      } finally {
        setIsLoadingOrganizations(false);
      }
    };

    loadBHUs();
  }, [isBHUDirectory]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isHospitalDirectory && !isBHUDirectory) {
      setIsAddDrawerOpen(false);
      resetForm();
      return;
    }

    if (isBHUDirectory) {
      const bhuData: BHUPayload = {
        name: name.trim(),
        addressLine: addressLine.trim(),
        dzongkhag: dzongkhagQuery.trim(),
        gewog: gewogQuery.trim(),
        telephone: telephone.trim(),
        email: email.trim(),
      };

      if (Object.values(bhuData).some((value) => !value)) {
        toast.error("Please fill in all BHU fields");
        return;
      }

      setIsSubmitting(true);
      try {
        const data = await createBHU(bhuData);
        setOrganizationItems((currentItems) => [
          mapBHUToDirectoryItem(data.bhu),
          ...currentItems,
        ]);
        toast.success("BHU added successfully");
        setIsAddDrawerOpen(false);
        resetForm();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to add BHU";
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const hospitalData: HospitalPayload = {
      name: name.trim(),
      type: typeQuery.trim(),
      addressLine: addressLine.trim(),
      dzongkhag: dzongkhagQuery.trim(),
      gewog: gewogQuery.trim(),
      telephone: telephone.trim(),
      email: email.trim(),
    };

    if (Object.values(hospitalData).some((value) => !value)) {
      toast.error("Please fill in all hospital fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await createHospital(hospitalData);
      setOrganizationItems((currentItems) => [
        mapHospitalToDirectoryItem(data.hospital),
        ...currentItems,
      ]);
      toast.success("Hospital added successfully");
      setIsAddDrawerOpen(false);
      resetForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add hospital";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">
            {directory.title}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {directory.description}
          </p>
        </div>
        <button
          onClick={() => setIsAddDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800"
        >
          <Plus className="h-4 w-4" />
          {directory.addLabel}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left text-sm leading-tight">
          <thead className="bg-neutral-100 text-xs uppercase tracking-wide text-neutral-600">
            <tr>
              <th className="px-4 py-2.5 font-semibold">
                {directory.nameHeader}
              </th>
              <th className="px-4 py-2.5 font-semibold">Dzongkhag</th>
              {isBHUDirectory ? (
                <>
                  <th className="px-4 py-2.5 font-semibold">Gewog</th>
                  <th className="px-4 py-2.5 font-semibold">Contact</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-2.5 font-semibold">Level</th>
                  <th className="px-4 py-2.5 font-semibold">Contact</th>
                </>
              )}
              <th className="px-4 py-2.5 font-semibold">Status</th>
              <th className="px-4 py-2.5 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {isLoadingOrganizations ? (
              <tr>
                <td
                  className="px-4 py-6 text-center text-neutral-500"
                  colSpan={6}
                >
                  Loading {isBHUDirectory ? "BHUs" : "hospitals"}...
                </td>
              </tr>
            ) : tableItems.length > 0 ? (
              tableItems.map((item) => (
                <tr key={item.id || item.name} className="hover:bg-neutral-50">
                  <td className="px-4 py-2.5 font-medium text-neutral-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-2.5 text-neutral-600">
                    {item.dzongkhag}
                  </td>
                  {isBHUDirectory ? (
                    <>
                      <td className="px-4 py-2.5 text-neutral-600">
                        {item.gewog}
                      </td>
                      <td className="px-4 py-2.5 text-neutral-600">
                        {item.contact}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2.5 text-neutral-600">
                        {item.level}
                      </td>
                      <td className="px-4 py-2.5 text-neutral-600">
                        {item.contact}
                      </td>
                    </>
                  )}
                  <td className="px-4 py-2.5">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                      aria-label={`Open actions for ${item.name}`}
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-4 py-6 text-center text-neutral-500"
                  colSpan={6}
                >
                  No {isBHUDirectory ? "BHUs" : "hospitals"} added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Sheet
        open={isAddDrawerOpen}
        onOpenChange={(open) => {
          setIsAddDrawerOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <SheetContent
          side="right"
          className="bottom-3 right-3 top-3 flex h-auto w-[min(92vw,34rem)] flex-col overflow-y-auto rounded-[1.5rem] border border-neutral-200 bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:max-w-none"
          overlayClassName="bg-neutral-900/25 backdrop-blur-[1px]"
        >
          <SheetHeader className="border-b border-neutral-200 pb-5">
            <SheetTitle className="text-2xl font-semibold text-neutral-950">
              {directory.addLabel}
            </SheetTitle>
            <SheetDescription className="text-sm text-neutral-500">
              Add the basic, location, and contact details.
            </SheetDescription>
          </SheetHeader>

          <form className="mt-6 flex flex-1 flex-col" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-4 border-b border-neutral-200 pb-5">
                <h3 className="border-l-4 border-blue-600 pl-3 text-base font-semibold text-neutral-950">
                  Basic Info
                </h3>
                <div
                  className={`grid gap-4 ${isBHUDirectory ? "" : "sm:grid-cols-[55fr_45fr]"}`}
                >
                  <div className="space-y-2">
                    <label
                      htmlFor="organization-name"
                      className="text-sm font-medium text-neutral-700"
                    >
                      {directory.nameHeader}
                    </label>
                    <input
                      id="organization-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      placeholder={`Enter ${directory.nameHeader.toLowerCase()}`}
                    />
                  </div>

                  {!isBHUDirectory ? (
                    <div className="space-y-2">
                      <label
                        htmlFor="organization-type"
                        className="text-sm font-medium text-neutral-700"
                      >
                        Type
                      </label>
                      <div
                        className="relative"
                        onBlur={(event) => {
                          if (
                            !event.currentTarget.contains(
                              event.relatedTarget as Node | null,
                            )
                          ) {
                            setIsTypeOpen(false);
                          }
                        }}
                      >
                        <input
                          id="organization-type"
                          value={typeQuery}
                          onChange={(event) => {
                            setTypeQuery(event.target.value);
                            setIsTypeOpen(true);
                          }}
                          onFocus={() => setIsTypeOpen(true)}
                          className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 pr-10 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                          placeholder="Search type"
                          role="combobox"
                          aria-expanded={isTypeOpen}
                          aria-controls="organization-type-options"
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          onClick={() => setIsTypeOpen((isOpen) => !isOpen)}
                          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                          aria-label="Toggle type options"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isTypeOpen ? "rotate-180" : ""}`}
                          />
                        </button>

                        {isTypeOpen && (
                          <div
                            id="organization-type-options"
                            role="listbox"
                            className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white p-1 shadow-lg"
                          >
                            {filteredOrganizationTypes.length > 0 ? (
                              filteredOrganizationTypes.map((type) => (
                                <button
                                  key={type}
                                  type="button"
                                  role="option"
                                  onMouseDown={(event) =>
                                    event.preventDefault()
                                  }
                                  onClick={() => {
                                    setTypeQuery(type);
                                    setIsTypeOpen(false);
                                  }}
                                  className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-neutral-700 hover:bg-blue-50 hover:text-blue-800"
                                >
                                  {type}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-neutral-500">
                                No type found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-4 border-b border-neutral-200 pb-5">
                <h3 className="border-l-4 border-blue-600 pl-3 text-base font-semibold text-neutral-950">
                  Location
                </h3>
                <div className="space-y-2">
                  <label
                    htmlFor="organization-address-line"
                    className="text-sm font-medium text-neutral-700"
                  >
                    Address Line
                  </label>
                  <input
                    id="organization-address-line"
                    value={addressLine}
                    onChange={(event) => setAddressLine(event.target.value)}
                    className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter address line"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="organization-gewog"
                      className="text-sm font-medium text-neutral-700"
                    >
                      Dzongkhag
                    </label>
                    <div
                      className="relative"
                      onBlur={(event) => {
                        if (
                          !event.currentTarget.contains(
                            event.relatedTarget as Node | null,
                          )
                        ) {
                          setIsDzongkhagOpen(false);
                        }
                      }}
                    >
                      <input
                        id="organization-dzongkhag"
                        value={dzongkhagQuery}
                        onChange={(event) => {
                          setDzongkhagQuery(event.target.value);
                          setGewogQuery("");
                          setIsDzongkhagOpen(true);
                        }}
                        onFocus={() => setIsDzongkhagOpen(true)}
                        className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 pr-10 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        placeholder="Search dzongkhag"
                        role="combobox"
                        aria-expanded={isDzongkhagOpen}
                        aria-controls="dzongkhag-options"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => setIsDzongkhagOpen((isOpen) => !isOpen)}
                        className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
                        aria-label="Toggle dzongkhag options"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${isDzongkhagOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isDzongkhagOpen && (
                        <div
                          id="dzongkhag-options"
                          role="listbox"
                          className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white p-1 shadow-lg"
                        >
                          {filteredDzongkhags.length > 0 ? (
                            filteredDzongkhags.map((dzongkhag) => (
                              <button
                                key={dzongkhag}
                                type="button"
                                role="option"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                  setDzongkhagQuery(dzongkhag);
                                  setGewogQuery("");
                                  setIsDzongkhagOpen(false);
                                }}
                                className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-neutral-700 hover:bg-blue-50 hover:text-blue-800"
                              >
                                {dzongkhag}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-neutral-500">
                              No dzongkhag found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="organization-dzongkhag"
                      className="text-sm font-medium text-neutral-700"
                    >
                      Gewog
                    </label>
                    <div
                      className="relative"
                      onBlur={(event) => {
                        if (
                          !event.currentTarget.contains(
                            event.relatedTarget as Node | null,
                          )
                        ) {
                          setIsGewogOpen(false);
                        }
                      }}
                    >
                      <input
                        id="organization-gewog"
                        value={gewogQuery}
                        onChange={(event) => {
                          setGewogQuery(event.target.value);
                          setIsGewogOpen(true);
                        }}
                        onFocus={() =>
                          selectedDzongkhag && setIsGewogOpen(true)
                        }
                        className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 pr-10 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        placeholder={
                          selectedDzongkhag
                            ? "Search gewog"
                            : "Select dzongkhag first"
                        }
                        role="combobox"
                        aria-expanded={isGewogOpen}
                        aria-controls="gewog-options"
                        autoComplete="off"
                        disabled={!selectedDzongkhag}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedDzongkhag) {
                            setIsGewogOpen((isOpen) => !isOpen);
                          }
                        }}
                        className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Toggle gewog options"
                        disabled={!selectedDzongkhag}
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${isGewogOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isGewogOpen && (
                        <div
                          id="gewog-options"
                          role="listbox"
                          className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white p-1 shadow-lg"
                        >
                          {filteredGewogs.length > 0 ? (
                            filteredGewogs.map((gewog) => (
                              <button
                                key={`${gewog.name}-${gewog.dzongkhag}`}
                                type="button"
                                role="option"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                  setGewogQuery(gewog.name);
                                  setIsGewogOpen(false);
                                }}
                                className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-neutral-700 hover:bg-blue-50 hover:text-blue-800"
                              >
                                {gewog.name}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-neutral-500">
                              No gewog found
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="border-l-4 border-blue-600 pl-3 text-base font-semibold text-neutral-950">
                  Contact
                </h3>
                <div className="grid gap-4 sm:grid-cols-[35fr_65fr]">
                  <div className="space-y-2">
                    <label
                      htmlFor="organization-telephone"
                      className="text-sm font-medium text-neutral-700"
                    >
                      Telephone Number
                    </label>
                    <input
                      id="organization-telephone"
                      value={telephone}
                      onChange={(event) => setTelephone(event.target.value)}
                      className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      placeholder="Enter telephone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="organization-email"
                      className="text-sm font-medium text-neutral-700"
                    >
                      Email
                    </label>
                    <input
                      id="organization-email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="mt-auto pt-6">
              <button
                type="button"
                onClick={() => {
                  setIsAddDrawerOpen(false);
                  resetForm();
                }}
                disabled={isSubmitting}
                className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Adding..." : directory.addLabel}
              </button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </section>
  );
}
