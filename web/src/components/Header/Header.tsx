import { useState, useRef, useEffect } from 'react';
import './Header.css';
import { Bell, LogOut, User } from 'lucide-react';

interface HeaderProps {
  onLogout: () => void;
}

export default function Header({ onLogout }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="dashboard-header">
      <div className="header-actions">
        <button className="icon-button">
          <Bell size={20} />
        </button>
        <div className="user-profile-container" ref={dropdownRef}>
          <div 
            className="user-profile" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="avatar">DT</div>
          </div>
          
          {isDropdownOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <span className="dropdown-name">DGI Teacher</span>
                <span className="dropdown-email">teacher@dgi.edu</span>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item">
                <User size={16} />
                <span>My Profile</span>
              </button>
              <button className="dropdown-item text-danger" onClick={onLogout}>
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
