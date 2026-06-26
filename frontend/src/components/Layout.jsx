import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="container page-fade">
        {children}
      </main>
      <footer className="app-footer">
        <div className="container footer-content">
          <p>&copy; 2026 EventSync. All rights reserved.</p>
          <p className="footer-links">
            <a href="#">Privacy Policy</a>
            <span className="separator">&bull;</span>
            <a href="#">Terms of Service</a>
          </p>
        </div>
      </footer>
      <style>{`
        .app-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        main {
          flex-grow: 1;
          padding: 40px 0;
        }
        .app-footer {
          background: rgba(6, 6, 12, 0.9);
          border-top: 1px solid var(--border-color);
          padding: 24px 0;
          color: var(--text-muted);
          font-size: 0.85rem;
          margin-top: auto;
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .footer-links {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .footer-links a:hover {
          color: var(--text-secondary);
        }
        .separator {
          color: var(--text-muted);
          opacity: 0.5;
        }
        @media (max-width: 768px) {
          .footer-content {
            flex-direction: column;
            gap: 12px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
