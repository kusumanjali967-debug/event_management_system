import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext, API_URL } from '../context/AuthContext';
import { Calendar, PlusCircle, AlertCircle, MapPin, Tag, DollarSign, Image } from 'lucide-react';

const CATEGORIES = ['Music', 'Tech', 'Sports', 'Arts', 'Business', 'Food', 'Others'];

const CreateEvent = () => {
  const { getAuthHeaders } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Music',
    price: 0,
    totalTickets: 50,
    image: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { title, description, date, time, location, category, price, totalTickets, image } = formData;

  const onChange = (e) => {
    const value = e.target.name === 'price' || e.target.name === 'totalTickets' 
      ? Number(e.target.value) 
      : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        navigate('/dashboard');
      } else {
        setError(data.message || 'Failed to create event. Please verify inputs.');
      }
    } catch (err) {
      setError('Could not connect to server.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-event-container page-fade">
      <div className="form-container" style={{ maxWidth: '650px', margin: '20px auto' }}>
        <div className="form-header">
          <PlusCircle className="form-header-icon" />
          <h2>Publish New Event</h2>
          <p>Create an interactive event page and sell tickets instantly</p>
        </div>

        {error && (
          <div className="error-alert">
            <AlertCircle className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              placeholder="e.g. Summer Music Festival 2026"
              value={title}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Event Description</label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              placeholder="Provide a detailed description of the event schedule, rules, and highlights..."
              value={description}
              onChange={onChange}
              required
            ></textarea>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="date">Date</label>
              <div className="input-with-icon">
                <Calendar className="input-icon" />
                <input
                  type="date"
                  id="date"
                  name="date"
                  className="form-input"
                  value={date}
                  onChange={onChange}
                  style={{ paddingLeft: '44px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="time">Time</label>
              <input
                type="text"
                id="time"
                name="time"
                className="form-input"
                placeholder="e.g. 7:00 PM"
                value={time}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="location">Location</label>
            <div className="input-with-icon">
              <MapPin className="input-icon" />
              <input
                type="text"
                id="location"
                name="location"
                className="form-input"
                placeholder="e.g. Madison Square Garden, NY or Online (Zoom)"
                value={location}
                onChange={onChange}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label" htmlFor="category">Category</label>
              <div className="input-with-icon">
                <Tag className="input-icon" />
                <select
                  id="category"
                  name="category"
                  className="form-select"
                  value={category}
                  onChange={onChange}
                  style={{ paddingLeft: '44px' }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="price">Ticket Price ($)</label>
              <div className="input-with-icon">
                <DollarSign className="input-icon" />
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  className="form-input"
                  placeholder="0 (Free)"
                  value={price}
                  onChange={onChange}
                  style={{ paddingLeft: '44px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="totalTickets">Capacity (Tickets)</label>
              <input
                type="number"
                id="totalTickets"
                name="totalTickets"
                min="1"
                className="form-input"
                placeholder="50"
                value={totalTickets}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="image">Banner Image URL (Optional)</label>
            <div className="input-with-icon">
              <Image className="input-icon" />
              <input
                type="url"
                id="image"
                name="image"
                className="form-input"
                placeholder="https://images.unsplash.com/... or leave blank"
                value={image}
                onChange={onChange}
                style={{ paddingLeft: '44px' }}
              />
            </div>
            <span className="field-hint">Provide an online image URL to display as a banner.</span>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating Event...' : 'Publish Event'}
          </button>
        </form>
      </div>

      <style>{`
        .create-event-container {
          padding-top: 10px;
        }
        .form-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .form-header-icon {
          width: 44px;
          height: 44px;
          color: var(--primary);
          margin-bottom: 10px;
        }
        .form-header h2 {
          font-size: 1.8rem;
          color: #fff;
        }
        .form-header p {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .input-with-icon {
          position: relative;
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
        }
        .btn-block {
          width: 100%;
          margin-top: 20px;
        }
        .field-hint {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 6px;
        }
        @media (max-width: 768px) {
          .grid-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CreateEvent;
