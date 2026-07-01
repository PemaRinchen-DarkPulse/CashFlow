import { MoreVertical, Clock } from 'lucide-react';
import './LessonPlanCard.css';

interface LessonPlanCardProps {
  status: 'Draft' | 'Published';
  dateTag?: string;
  cycle: string;
  subject: string;
  title: string;
  subtitle: string;
  updatedAt: string;
}

export default function LessonPlanCard({
  status,
  dateTag,
  cycle,
  subject,
  title,
  subtitle,
  updatedAt
}: LessonPlanCardProps) {
  return (
    <div className="lesson-plan-card">
      <div className="card-header">
        {dateTag ? (
          <span className="status-tag tag-green">{dateTag}</span>
        ) : (
          <span className="status-tag tag-gray">{status}</span>
        )}
        <button className="action-button">
          <MoreVertical size={16} />
        </button>
      </div>
      
      <div className="card-body">
        <div className="card-meta">
          {cycle} &bull; {subject}
        </div>
        <h3 className="card-title">{title} &mdash;</h3>
        <p className="card-subtitle">{subtitle}</p>
      </div>
      
      <div className="card-actions">
        <button className="attach-button">
          <Clock size={16} />
          Attach to Timetable
        </button>
      </div>
      
      <div className="card-footer">
        Updated on {updatedAt}
      </div>
    </div>
  );
}
