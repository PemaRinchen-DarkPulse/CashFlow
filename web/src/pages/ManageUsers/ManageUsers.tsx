import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Filter, MoreHorizontal, X, ChevronDown, Check } from 'lucide-react';
import '../Students/Students.css'; // Reusing identical styles for consistency

interface UserDto {
  id: number;
  email: string;
  role: string;
  studentId: string | null;
  name: string | null;
  phoneNumber: string | null;
  status: string;
}

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  isSearchable?: boolean;
}

function CustomSelect({ options, value, onChange, placeholder = "Select...", className = "", isSearchable = false }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && isSearchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isSearchable]);

  const selectedOption = options.find(opt => opt.value === value);
  const filteredOptions = isSearchable 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  return (
    <div className={`custom-select-container ${className}`} ref={selectRef}>
      <div 
        className={`custom-select-trigger ${isOpen ? 'open' : ''} ${!selectedOption ? 'placeholder' : ''}`}
        onClick={() => {
          if (!isOpen) setSearchTerm('');
          setIsOpen(!isOpen);
        }}
      >
        <span className="trigger-text">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={16} className={`select-chevron ${isOpen ? 'open' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="custom-select-dropdown">
          {isSearchable && (
            <div className="custom-select-search">
              <Search size={14} className="search-icon-small" />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="custom-select-options-list">
            {filteredOptions.length > 0 ? filteredOptions.map((option) => (
              <div 
                key={option.value}
                className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
              >
                <span>{option.label}</span>
                {value === option.value && <Check size={16} className="check-icon" />}
              </div>
            )) : (
              <div className="custom-select-no-results">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const MOCK_USERS: UserDto[] = [
  { id: 1, email: 'admin@greenfield.edu.bt', role: 'ROLE_ADMIN', studentId: null, name: 'Dorji Wangmo', phoneNumber: '17112233', status: 'Active' },
  { id: 2, email: 'teacher1@greenfield.edu.bt', role: 'ROLE_TEACHER', studentId: null, name: 'Tshering Penjor', phoneNumber: '17223344', status: 'Active' },
  { id: 3, email: 'canteen@greenfield.edu.bt', role: 'ROLE_CANTEEN', studentId: null, name: 'Sangay Dema', phoneNumber: '17334455', status: 'Active' },
  { id: 4, email: 'store@greenfield.edu.bt', role: 'ROLE_STORE', studentId: null, name: 'Phuntsho Norbu', phoneNumber: '17445566', status: 'Active' },
  { id: 5, email: 'librarian@greenfield.edu.bt', role: 'ROLE_LIBRARIAN', studentId: null, name: 'Chimi Yangzom', phoneNumber: '17556677', status: 'Active' },
  { id: 6, email: 'teacher2@greenfield.edu.bt', role: 'ROLE_TEACHER', studentId: null, name: 'Rinzin Dorji', phoneNumber: null, status: 'Inactive' },
];

export default function ManageUsers() {
  const [users, setUsers] = useState<UserDto[]>(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSaveUser = () => {
    if (!name || !email || !password || !role) {
      setFormError('Please fill in all required fields (Name, Email, Password, Role)');
      return;
    }
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');
    
    // Add to local state
    const newUser: UserDto = {
      id: Date.now(),
      name,
      email,
      phoneNumber: phoneNumber || null,
      role,
      studentId: null,
      status: 'Active',
    };
    
    setUsers(prev => [...prev, newUser]);
    setIsDrawerOpen(false);
    setName('');
    setEmail('');
    setPassword('');
    setPhoneNumber('');
    setRole('');
    setIsSubmitting(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Manage Users</h1>
          <p className="text-gray-500">View and manage system access and roles</p>
        </div>
        <button className="create-button" onClick={() => setIsDrawerOpen(true)}>
          <Plus size={16} />
          Add User
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search users by email or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters-group">
          <button className="clear-filters" disabled={!searchTerm} onClick={() => setSearchTerm('')}>
            Clear Filters
          </button>
          <div className="view-toggles">
            <button className="view-toggle active"><Filter size={18} /></button>
          </div>
        </div>
      </div>

      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email / Username</th>
              <th className="phone-column">Phone Number</th>
              <th className="grade-column">Status</th>
              <th className="grade-column">Role</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">No users found.</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="student-name-cell">
                      <div className="student-avatar">{user.name ? user.name.substring(0, 2).toUpperCase() : user.email.substring(0, 2).toUpperCase()}</div>
                      <span className="font-medium">{user.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td className="phone-column">{user.phoneNumber || <span className="text-gray-400">N/A</span>}</td>
                  <td className="grade-column">
                    <span className={`status-badge ${user.status === 'Active' ? 'active' : 'inactive'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="grade-column">
                    <span className={`status-badge ${user.role === 'ROLE_ADMIN' ? 'active' : 'inactive'}`}>
                      {user.role.replace('ROLE_', '')}
                    </span>
                  </td>
                  <td className="actions-column">
                    <div className="action-menu-container">
                      <button className="action-button">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer Overlay */}
      <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
      
      {/* Drawer */}
      <div className={`student-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>Add New User</h2>
          <button className="close-drawer-btn" onClick={() => setIsDrawerOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="drawer-content">
          <div className="drawer-section">
            {formError && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>{formError}</div>}
            
            <div className="form-field">
              <label className="field-label">Full Name *</label>
              <input type="text" className="drawer-input" placeholder="e.g. Karma Dorji" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            
            <div className="form-field">
              <label className="field-label">Email Address *</label>
              <input type="email" className="drawer-input" placeholder="user@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            
            <div className="form-field">
              <label className="field-label">Password *</label>
              <input type="password" className="drawer-input" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            
            <div className="form-row form-row-60-40">
              <div className="form-field mb-0">
                <label className="field-label">Phone Number</label>
                <input type="text" className="drawer-input" placeholder="e.g. 17XXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
              </div>

              <div className="form-field mb-0">
                <label className="field-label">Role *</label>
                <CustomSelect 
                  options={[
                    { value: 'ROLE_TEACHER', label: 'Teacher' },
                    { value: 'ROLE_CANTEEN', label: 'Canteen' },
                    { value: 'ROLE_STORE', label: 'Store' },
                    { value: 'ROLE_LIBRARIAN', label: 'Librarian' }
                  ]}
                  value={role}
                  onChange={setRole}
                  placeholder="Select Role"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="drawer-footer">
          <button className="btn-secondary" onClick={() => setIsDrawerOpen(false)} disabled={isSubmitting}>Cancel</button>
          <button className="btn-primary" onClick={handleSaveUser} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save User'}
          </button>
        </div>
      </div>
    </div>
  );
}
