import './Dashboard.css';
import { Users, BookOpen, Clock, Award, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p className="page-subtitle">Here's an overview of your classes and performance.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <Users size={24} />
          </div>
          <div className="stat-details">
            <h3>Total Students</h3>
            <p className="stat-value">2,451</p>
            <span className="stat-trend positive"><TrendingUp size={16} /> +12% this month</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon blue">
            <BookOpen size={24} />
          </div>
          <div className="stat-details">
            <h3>Active Courses</h3>
            <p className="stat-value">14</p>
            <span className="stat-trend">Ongoing</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Clock size={24} />
          </div>
          <div className="stat-details">
            <h3>Hours Taught</h3>
            <p className="stat-value">128</p>
            <span className="stat-trend positive"><TrendingUp size={16} /> +5% this week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Award size={24} />
          </div>
          <div className="stat-details">
            <h3>Average Rating</h3>
            <p className="stat-value">4.8</p>
            <span className="stat-trend">Out of 5.0</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content-grid">
        <div className="main-content-card">
          <div className="card-header">
            <h2>Recent Activities</h2>
            <button className="btn-secondary">View All</button>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-dot blue"></div>
              <div className="activity-info">
                <h4>Graded "Midterm Mathematics"</h4>
                <p>2 hours ago</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot green"></div>
              <div className="activity-info">
                <h4>Published new lesson plan</h4>
                <p>5 hours ago</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot purple"></div>
              <div className="activity-info">
                <h4>Meeting with John Doe</h4>
                <p>Yesterday</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot orange"></div>
              <div className="activity-info">
                <h4>Updated course syllabus</h4>
                <p>2 days ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="side-content-card">
          <div className="card-header">
            <h2>Upcoming Classes</h2>
          </div>
          <div className="class-list">
            <div className="class-item">
              <div className="class-time">09:00 AM</div>
              <div className="class-info">
                <h4>Advanced Physics</h4>
                <p>Room 302</p>
              </div>
            </div>
            <div className="class-item">
              <div className="class-time">11:30 AM</div>
              <div className="class-info">
                <h4>Linear Algebra</h4>
                <p>Online Zoom</p>
              </div>
            </div>
            <div className="class-item">
              <div className="class-time">02:00 PM</div>
              <div className="class-info">
                <h4>Computer Science 101</h4>
                <p>Lab 4</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
