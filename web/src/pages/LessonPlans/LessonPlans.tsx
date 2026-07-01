import { Search, Plus, LayoutGrid, List } from 'lucide-react';
import LessonPlanCard from '../../components/LessonPlanCard/LessonPlanCard';
import './LessonPlans.css';

// Mock data matching the screenshot
const LESSON_PLANS = [
  {
    id: 1,
    status: 'Draft' as const,
    cycle: 'PP • Cycle 5',
    subject: 'Mathematics',
    title: 'Exploring Mathematics',
    subtitle: 'Grade 0, day 12, period 2 -...',
    updatedAt: 'Apr 18, 2026'
  },
  {
    id: 2,
    status: 'Published' as const,
    dateTag: 'Apr 17, 2026 • Friday • P9',
    cycle: 'Grade 7 • Cycle 2',
    subject: 'Mathematics',
    title: 'Applying Mathematics',
    subtitle: 'Grade 7, day 19, period 9 -...',
    updatedAt: 'Apr 17, 2026'
  },
  {
    id: 3,
    status: 'Published' as const,
    dateTag: 'Apr 17, 2026 • Friday • P3',
    cycle: 'Grade 1 • Cycle 2',
    subject: 'English',
    title: 'Applying English',
    subtitle: 'Grade 1, day 19, period 3 - design...',
    updatedAt: 'Apr 17, 2026'
  },
  {
    id: 4,
    status: 'Draft' as const,
    cycle: 'Grade 1 • Cycle 2',
    subject: 'English',
    title: 'Synthesising English',
    subtitle: 'Grade 1, day 1, period 1 -...',
    updatedAt: 'Apr 17, 2026'
  },
  {
    id: 5,
    status: 'Published' as const,
    dateTag: 'Apr 16, 2026 • Thursday • P4',
    cycle: 'Grade 9 • Cycle 2',
    subject: 'Aesthetics',
    title: 'Investigating Aesthetics',
    subtitle: 'Grade 9, day 18, period 4 -...',
    updatedAt: 'Apr 16, 2026'
  },
  {
    id: 6,
    status: 'Published' as const,
    dateTag: 'Apr 15, 2026 • Wednesday • P6',
    cycle: 'Grade 6 • Cycle 2',
    subject: 'Dzongkha',
    title: 'Exploring Dzongkha',
    subtitle: 'Grade 6, day 17, period 6 -...',
    updatedAt: 'Apr 15, 2026'
  },
  {
    id: 7,
    status: 'Published' as const,
    dateTag: 'Apr 14, 2026 • Tuesday • P8',
    cycle: 'Grade 3 • Cycle 2',
    subject: 'Sports',
    title: 'Investigating Sports',
    subtitle: 'Grade 3, day 16, period 8 -...',
    updatedAt: 'Apr 14, 2026'
  },
  {
    id: 8,
    status: 'Published' as const,
    dateTag: 'Apr 10, 2026 • Friday • P7',
    cycle: 'Grade 4 • Cycle 2',
    subject: 'Sports',
    title: 'Synthesising Sports',
    subtitle: 'Grade 4, day 15, period 7 -...',
    updatedAt: 'Apr 10, 2026'
  }
];

export default function LessonPlans() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Lesson Plans</h1>
        <button className="create-button">
          <Plus size={16} />
          Create Lesson Plan
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search lesson plans" />
        </div>
        
        <div className="filters-group">
          <select defaultValue="">
            <option value="" disabled hidden>All Grades</option>
            <option value="all">All Grades</option>
          </select>
          
          <select defaultValue="">
            <option value="" disabled hidden>All Domains</option>
            <option value="all">All Domains</option>
          </select>
          
          <select defaultValue="">
            <option value="" disabled hidden>All Status</option>
            <option value="all">All Status</option>
          </select>
          
          <button className="clear-filters" disabled>Clear Filters</button>
          
          <div className="view-toggles">
            <button className="view-toggle active"><LayoutGrid size={18} /></button>
            <button className="view-toggle"><List size={18} /></button>
          </div>
        </div>
      </div>

      <div className="lesson-plans-grid">
        {LESSON_PLANS.map(plan => (
          <LessonPlanCard key={plan.id} {...plan} />
        ))}
      </div>
    </div>
  );
}
