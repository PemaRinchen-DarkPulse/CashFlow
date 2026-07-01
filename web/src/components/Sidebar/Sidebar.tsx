import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import { 
  LayoutDashboard, 
  CalendarDays, 
  FileText, 
  Users, 
  Map, 
  ClipboardCheck, 
  BarChart3, 
  Star, 
  Megaphone,
  ChevronDown,
  UserCog,
  Utensils,
  Package,
  Library
} from 'lucide-react';

export default function Sidebar() {
  const getNavClass = ({ isActive }: { isActive: boolean }) => 
    isActive ? "nav-item active" : "nav-item";

  // Default to admin view — all nav items visible
  const isAdmin = true;
  const isStudent = false;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">GR</div>
        <span className="logo-text">Greenfield Academy</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" className={getNavClass} end>
          <LayoutDashboard className="nav-icon" size={18} />
          <span>Dashboard</span>
        </NavLink>
        
        {isAdmin && (
          <NavLink to="/students" className={getNavClass}>
            <Users className="nav-icon" size={18} />
            <span>Students</span>
          </NavLink>
        )}
        
        {isAdmin ? (
          <NavLink to="/manage-users" className={getNavClass}>
            <UserCog className="nav-icon" size={18} />
            <span>Manage User</span>
          </NavLink>
        ) : isStudent ? (
          <NavLink to="/menu" className={getNavClass}>
            <Utensils className="nav-icon" size={18} />
            <span>Menu</span>
          </NavLink>
        ) : (
          <NavLink to="/timetable" className={getNavClass}>
            <CalendarDays className="nav-icon" size={18} />
            <span>Timetable</span>
          </NavLink>
        )}
        
        <NavLink to="/lesson-plans" className={getNavClass}>
          <FileText className="nav-icon" size={18} />
          <span>Lesson Plans</span>
        </NavLink>
        
        <NavLink to="/store-inventory" className={getNavClass}>
          <Package className="nav-icon" size={18} />
          <span>Store Inventory</span>
        </NavLink>
        
        <NavLink to="/library" className={getNavClass}>
          <Library className="nav-icon" size={18} />
          <span>Library</span>
        </NavLink>

        <div className="nav-divider"></div>
        
        <NavLink to="/roadmap" className={getNavClass}>
          <Map className="nav-icon" size={18} />
          <span>Roadmap</span>
          <ChevronDown className="nav-chevron" size={16} />
        </NavLink>
        
        <NavLink to="/evaluation" className={getNavClass}>
          <ClipboardCheck className="nav-icon" size={18} />
          <span>Evaluation</span>
          <ChevronDown className="nav-chevron" size={16} />
        </NavLink>
        
        <NavLink to="/reports" className={getNavClass}>
          <BarChart3 className="nav-icon" size={18} />
          <span>Reports</span>
          <ChevronDown className="nav-chevron" size={16} />
        </NavLink>
        
        <NavLink to="/appraisals" className={getNavClass}>
          <Star className="nav-icon" size={18} />
          <span>Appraisals</span>
        </NavLink>
        
        <NavLink to="/announcements" className={getNavClass}>
          <Megaphone className="nav-icon" size={18} />
          <span>Announcements</span>
        </NavLink>
      </nav>
    </aside>
  );
}
