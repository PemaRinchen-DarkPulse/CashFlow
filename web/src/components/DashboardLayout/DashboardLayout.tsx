import './DashboardLayout.css';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export default function DashboardLayout({ children, onLogout }: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Header onLogout={onLogout} />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}
