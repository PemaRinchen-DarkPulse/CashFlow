import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash2, PlusCircle, X, ChevronDown, Check } from 'lucide-react';
import './Students.css';

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

const GRADE_OPTIONS = [
  { value: '7', label: 'Grade 7' },
  { value: '8', label: 'Grade 8' },
  { value: '9', label: 'Grade 9' },
  { value: '10', label: 'Grade 10' },
  { value: '11', label: 'Grade 11' },
  { value: '12', label: 'Grade 12' },
];

const DZONGKHAG_OPTIONS = [
  { value: 'Bumthang', label: 'Bumthang' },
  { value: 'Chukha', label: 'Chukha' },
  { value: 'Dagana', label: 'Dagana' },
  { value: 'Gasa', label: 'Gasa' },
  { value: 'Haa', label: 'Haa' },
  { value: 'Lhuntse', label: 'Lhuntse' },
  { value: 'Mongar', label: 'Mongar' },
  { value: 'Paro', label: 'Paro' },
  { value: 'Pemagatshel', label: 'Pemagatshel' },
  { value: 'Punakha', label: 'Punakha' },
  { value: 'Samdrup Jongkhar', label: 'Samdrup Jongkhar' },
  { value: 'Samtse', label: 'Samtse' },
  { value: 'Sarpang', label: 'Sarpang' },
  { value: 'Thimphu', label: 'Thimphu' },
  { value: 'Trashigang', label: 'Trashigang' },
  { value: 'Trashi Yangtse', label: 'Trashi Yangtse' },
  { value: 'Trongsa', label: 'Trongsa' },
  { value: 'Tsirang', label: 'Tsirang' },
  { value: 'Wangdue Phodrang', label: 'Wangdue Phodrang' },
  { value: 'Zhemgang', label: 'Zhemgang' },
];

const MOCK_STUDENTS = [
  { id: 1, studentId: 'UID-1001', name: 'Karma Dorji', email: 'karma.dorji@school.edu.bt', grade: '10', dzongkhag: 'Thimphu', status: 'Active', walletAmount: 1500.00 },
  { id: 2, studentId: 'UID-1002', name: 'Pema Lhamo', email: 'pema.lhamo@school.edu.bt', grade: '9', dzongkhag: 'Paro', status: 'Active', walletAmount: 2200.50 },
  { id: 3, studentId: 'UID-1003', name: 'Tshering Wangchuk', email: 'tshering.w@school.edu.bt', grade: '11', dzongkhag: 'Punakha', status: 'Active', walletAmount: 800.00 },
  { id: 4, studentId: 'UID-1004', name: 'Sonam Choden', email: 'sonam.c@school.edu.bt', grade: '8', dzongkhag: 'Bumthang', status: 'Inactive', walletAmount: 0.00 },
  { id: 5, studentId: 'UID-1005', name: 'Jigme Namgyal', email: 'jigme.n@school.edu.bt', grade: '12', dzongkhag: 'Haa', status: 'Active', walletAmount: 3100.75 },
  { id: 6, studentId: 'UID-1006', name: 'Dechen Yangzom', email: 'dechen.y@school.edu.bt', grade: '7', dzongkhag: 'Mongar', status: 'Active', walletAmount: 950.25 },
  { id: 7, studentId: 'UID-1007', name: 'Ugyen Tenzin', email: 'ugyen.t@school.edu.bt', grade: '10', dzongkhag: 'Trashigang', status: 'Active', walletAmount: 1750.00 },
  { id: 8, studentId: 'UID-1008', name: 'Kinley Zangmo', email: 'kinley.z@school.edu.bt', grade: '9', dzongkhag: 'Samtse', status: 'Inactive', walletAmount: 450.00 },
];

export default function Students() {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedDzongkhag, setSelectedDzongkhag] = useState('');
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [students, setStudents] = useState(MOCK_STUDENTS);

  useEffect(() => {
    function handleClickOutside() {
      setActiveDropdown(null);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleDropdown = (e: React.MouseEvent, studentId: number) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === studentId ? null : studentId);
  };

  const handleSaveStudent = () => {
    if (!studentId || !name || !email || !pin || !selectedGrade || !selectedDzongkhag) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    // Add to local state
    const newStudent = {
      id: Date.now(),
      studentId,
      name,
      email,
      pin,
      grade: selectedGrade,
      dzongkhag: selectedDzongkhag,
      status: 'Active',
      walletAmount: 0.00,
    };
    
    setStudents(prev => [...prev, newStudent]);
    setIsDrawerOpen(false);
    setStudentId('');
    setName('');
    setEmail('');
    setPin('');
    setSelectedGrade('');
    setSelectedDzongkhag('');
    setIsSubmitting(false);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Students</h1>
        <button className="create-button" onClick={() => setIsDrawerOpen(true)}>
          <Plus size={16} />
          Add Student
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search students by name or Student ID" />
        </div>
        
        <div className="filters-group">
          <select defaultValue="">
            <option value="" disabled hidden>All Grades</option>
            <option value="all">All Grades</option>
            <option value="7">Grade 7</option>
            <option value="8">Grade 8</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
          </select>
          
          <select defaultValue="">
            <option value="" disabled hidden>All Dzongkhags</option>
            <option value="all">All Dzongkhags</option>
            {DZONGKHAG_OPTIONS.map(d => <option key={d.value} value={d.value.toLowerCase()}>{d.label}</option>)}
          </select>
          
          <select defaultValue="">
            <option value="" disabled hidden>Status</option>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button className="clear-filters" disabled>Clear Filters</button>
          
          <div className="view-toggles">
            <button className="view-toggle active"><Filter size={18} /></button>
          </div>
        </div>
      </div>

      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Email</th>
              <th className="grade-column">Grade</th>
              <th>Dzongkhag</th>
              <th>Status</th>
              <th className="wallet-column">Wallet Amount</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td className="font-medium text-gray-900">{student.studentId}</td>
                <td>
                  <div className="student-name-cell">
                    <div className="student-avatar">{student.name.substring(0, 2).toUpperCase()}</div>
                    <span className="font-medium">{student.name}</span>
                  </div>
                </td>
                <td>{student.email}</td>
                <td className="grade-column">{student.grade}</td>
                <td>{student.dzongkhag}</td>
                <td>
                  <span className={`status-badge ${student.status.toLowerCase()}`}>
                    {student.status}
                  </span>
                </td>
                <td className="font-medium text-gray-900 wallet-column">Nu. {student.walletAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="actions-column">
                  <div className="action-menu-container">
                    <button 
                      className="action-button"
                      onClick={(e) => toggleDropdown(e, student.id)}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {activeDropdown === student.id && (
                      <div className="action-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                        <button className="dropdown-item">
                          <Edit size={16} />
                          <span>Edit</span>
                        </button>
                        <button className="dropdown-item">
                          <PlusCircle size={16} />
                          <span>Add Credits</span>
                        </button>
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item text-danger">
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Drawer Overlay */}
      <div className={`drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}></div>
      
      {/* Drawer */}
      <div className={`student-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2>Add Student</h2>
          <button className="close-drawer-btn" onClick={() => setIsDrawerOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="drawer-content">

          <div className="drawer-section">
            {error && <div style={{ color: '#ef4444', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
            
            <div className="form-field">
              <label className="field-label">Student ID</label>
              <input type="text" className="drawer-input" placeholder="e.g. UID-1001" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
            </div>
            
            <div className="form-field">
              <label className="field-label">Name</label>
              <input type="text" className="drawer-input" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            
            <div className="form-field">
              <label className="field-label">Email</label>
              <input type="email" className="drawer-input" placeholder="student@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            
            <div className="form-row form-row-40-60">
              <div className="form-field mb-0">
                <label className="field-label">PIN</label>
                <input 
                  type="number" 
                  className="drawer-input" 
                  placeholder="PIN (numbers)" 
                  min="0"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
              
              <div className="form-field mb-0">
                <label className="field-label">Grade</label>
                <CustomSelect 
                  options={GRADE_OPTIONS}
                  value={selectedGrade}
                  onChange={setSelectedGrade}
                  placeholder="Select Grade"
                />
              </div>
            </div>
            
            <div className="form-field">
              <label className="field-label">Dzongkhag</label>
              <CustomSelect 
                options={DZONGKHAG_OPTIONS}
                value={selectedDzongkhag}
                onChange={setSelectedDzongkhag}
                placeholder="Select Dzongkhag"
                isSearchable={true}
              />
            </div>
          </div>
          

        </div>
        
        <div className="drawer-footer">
          <button className="btn-secondary" onClick={() => setIsDrawerOpen(false)} disabled={isSubmitting}>Cancel</button>
          <button className="btn-primary" onClick={handleSaveStudent} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Student'}
          </button>
        </div>
      </div>
    </div>
  );
}
