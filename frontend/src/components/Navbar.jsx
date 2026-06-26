import React, { useContext, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Calendar, 
  LayoutDashboard, 
  PlusCircle, 
  Ticket, 
  CheckSquare, 
  LogOut, 
  LogIn, 
  UserPlus, 
  Menu, 
  X 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) => 
    `nav-link-item ${isActive ? 'active-nav' : ''}`;

  return (
    <nav className="navbar-container">
      <div className="container nav-content">
        <Link to="/" className="nav-logo">
          <Calendar className="logo-icon" />
          <span>Event<span className="logo-accent">Sync</span></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links">
          <NavLink to="/" end className={navLinkClass}>
            Explore
          </NavLink>

          {user && user.role === 'attendee' && (
            <NavLink to="/bookings" className={navLinkClass}>
              <Ticket className="nav-icon" /> My Bookings
            </NavLink>
          )}

          {user && user.role === 'organizer' && (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                <LayoutDashboard className="nav-icon" /> Dashboard
              </NavLink>
              <NavLink to="/create-event" className={navLinkClass}>
                <PlusCircle className="nav-icon" /> Create Event
              </NavLink>
              <NavLink to="/check-in" className={navLinkClass}>
                <CheckSquare className="nav-icon" /> Check In
              </NavLink>
            </>
          )}

          {user ? (
            <div className="user-profile-menu">
              <span className="user-name-badge">
                {user.name} ({user.role})
              </span>
              <button onClick={handleLogout} className="btn-logout">
                <LogOut className="nav-icon" />
              </button>
            </div>
          ) : (
            <div className="auth-btn-group">
              <Link to="/login" className="btn-login">
                <LogIn className="nav-icon" /> Login
              </Link>
              <Link to="/register" className="btn-register">
                <UserPlus className="nav-icon" /> Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <NavLink 
            to="/" 
            end 
            className={navLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            Explore
          </NavLink>

          {user && user.role === 'attendee' && (
            <NavLink 
              to="/bookings" 
              className={navLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              My Bookings
            </NavLink>
          )}

          {user && user.role === 'organizer' && (
            <>
              <NavLink 
                to="/dashboard" 
                className={navLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/create-event" 
                className={navLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Event
              </NavLink>
              <NavLink 
                to="/check-in" 
                className={navLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                Check In
              </NavLink>
            </>
          )}

          {user ? (
            <div className="mobile-user-section">
              <div className="user-info-text">
                {user.name} ({user.role})
              </div>
              <button 
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }} 
                className="btn btn-danger btn-sm"
                style={{ width: '100%', marginTop: '10px' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="mobile-auth-group">
              <Link 
                to="/login" 
                className="btn btn-secondary" 
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary" 
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Embedded navbar styling */}
      <style>{`
        .navbar-container {
          background: rgba(13, 13, 24, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 100;
          height: 70px;
          display: flex;
          align-items: center;
        }
        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.5rem;
          font-weight: 800;
          color: #fff;
        }
        .logo-icon {
          color: var(--primary);
          width: 28px;
          height: 28px;
        }
        .logo-accent {
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .nav-link-item {
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          border: 1px solid transparent;
        }
        .nav-link-item:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.04);
        }
        .active-nav {
          color: #fff;
          background: rgba(99, 102, 241, 0.1);
          border-color: rgba(99, 102, 241, 0.2);
        }
        .nav-icon {
          width: 16px;
          height: 16px;
        }
        .user-profile-menu {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-left: 12px;
          border-left: 1px solid var(--border-color);
        }
        .user-name-badge {
          background: rgba(255, 255, 255, 0.05);
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }
        .btn-logout {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: var(--radius-sm);
          transition: var(--transition);
        }
        .btn-logout:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
        .auth-btn-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .btn-login {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.95rem;
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .btn-login:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .btn-register {
          background: var(--primary-gradient);
          color: #fff;
          font-weight: 600;
          font-size: 0.95rem;
          padding: 8px 16px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
        }
        .btn-register:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 15px rgba(99, 102, 241, 0.3);
        }
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
        }
        .mobile-drawer {
          display: none;
        }
        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          .mobile-menu-btn {
            display: block;
          }
          .mobile-drawer {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 70px;
            left: 0;
            width: 100%;
            background: var(--bg-dark);
            border-bottom: 1px solid var(--border-color);
            padding: 20px;
            gap: 16px;
            box-shadow: var(--shadow-md);
            animation: slideUp 0.25s ease-out;
          }
          .mobile-drawer .nav-link-item {
            width: 100%;
          }
          .mobile-auth-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .mobile-user-section {
            border-top: 1px solid var(--border-color);
            padding-top: 10px;
          }
          .user-info-text {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-bottom: 8px;
            text-align: center;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
