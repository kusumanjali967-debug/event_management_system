import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, User, Mail, Lock, Users, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'attendee'
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { name, email, password, role } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-container page-fade">
      <div className="form-header">
        <UserPlus className="form-header-icon" />
        <h2>Create Account</h2>
        <p>Join EventSync to book tickets or organize events</p>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Full Name</label>
          <div className="input-with-icon">
            <User className="input-icon" />
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <div className="input-with-icon">
            <Mail className="input-icon" />
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <div className="input-with-icon">
            <Lock className="input-icon" />
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="role">Account Type</label>
          <div className="input-with-icon">
            <Users className="input-icon" />
            <select
              id="role"
              name="role"
              className="form-select"
              value={role}
              onChange={onChange}
              style={{ paddingLeft: '44px' }}
            >
              <option value="attendee">Attendee (Buy Tickets)</option>
              <option value="organizer">Organizer (Create Events)</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="form-footer">
        Already have an account? <Link to="/login" className="form-link">Sign In</Link>
      </div>

      <style>{`
        .form-header {
          text-align: center;
          margin-bottom: 30px;
        }
        .form-header-icon {
          width: 48px;
          height: 48px;
          color: var(--primary);
          margin-bottom: 12px;
        }
        .form-header h2 {
          font-size: 1.8rem;
          margin-bottom: 8px;
        }
        .form-header p {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }
        .input-with-icon {
          position: relative;
        }
        .input-with-icon .form-input, .input-with-icon .form-select {
          padding-left: 44px;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: var(--text-muted);
        }
        .error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-sm);
          color: #f87171;
          padding: 12px 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
        }
        .alert-icon {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }
        .btn-block {
          width: 100%;
          margin-top: 10px;
        }
        .form-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .form-link {
          color: var(--primary);
          font-weight: 600;
        }
        .form-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Register;
