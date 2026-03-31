import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, List, BarChart2, User } from 'lucide-react';
import './MainLayout.css';

const navItems = [
  { path: '/', label: 'Overview', icon: Home },
  { path: '/transactions', label: 'History', icon: List },
  { path: '/add', label: 'Add', icon: PlusCircle },
  { path: '/insights', label: 'Insights', icon: BarChart2 },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function MainLayout({ children }) {
  return (
    <div className="layout-container">
      {/* Sidebar for Desktop */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="Finance Logo" className="sidebar-logo" />
          <span>Finance Web</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                end={item.path === '/'}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="content">{children}</main>

      {/* Bottom Nav for Mobile */}
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? 'bottom-nav-item active' : 'bottom-nav-item')}
              end={item.path === '/'}
            >
              <Icon size={24} />
              <span className="bottom-nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
