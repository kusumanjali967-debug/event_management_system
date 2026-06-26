import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext, API_URL } from '../context/AuthContext';
import { Ticket, Calendar, MapPin, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

const MyBookings = () => {
  const { getAuthHeaders } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bookings/my-bookings`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bookings-container page-fade">
      <div className="section-header">
        <h1>My Tickets</h1>
        <p>Manage your booked experiences and get check-in QR codes</p>
      </div>

      {loading ? (
        <div className="loading-state flex-center" style={{ minHeight: '30vh' }}>
          <div className="spinner"></div>
          <span>Fetching bookings...</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state" style={{ padding: '60px 20px' }}>
          <Ticket size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3>No bookings yet</h3>
          <p>Explore upcoming events and reserve your spot today!</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className="card booking-card">
              <div className="booking-status-col">
                {booking.checkInStatus.checkedIn ? (
                  <div className="status-indicator checked">
                    <CheckCircle className="status-icon" />
                    <span>Redeemed</span>
                  </div>
                ) : (
                  <div className="status-indicator active">
                    <Clock className="status-icon" />
                    <span>Valid Ticket</span>
                  </div>
                )}
              </div>

              <div className="booking-info-col">
                <span className="booking-event-category">{booking.event.category}</span>
                <h3 className="booking-event-title">{booking.event.title}</h3>
                
                <div className="booking-meta-row">
                  <div className="booking-meta-item">
                    <Calendar size={14} className="meta-icon" />
                    <span>{formatDate(booking.event.date)} at {booking.event.time}</span>
                  </div>
                  <div className="booking-meta-item">
                    <MapPin size={14} className="meta-icon" />
                    <span>{booking.event.location}</span>
                  </div>
                </div>

                <div className="booking-details-row">
                  <span>Tickets: <strong>{booking.ticketsCount}</strong></span>
                  <span className="separator">&bull;</span>
                  <span>Paid: <strong>${booking.totalAmount}</strong></span>
                  <span className="separator">&bull;</span>
                  <span className="transaction-id">ID: <code>{booking._id.substr(-8).toUpperCase()}</code></span>
                </div>
              </div>

              <div className="booking-action-col">
                <Link to={`/bookings/${booking._id}`} className="btn btn-primary btn-icon">
                  View Ticket <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .bookings-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
          max-width: 900px;
          margin: 0 auto;
        }
        .section-header h1 {
          font-size: 2.2rem;
          margin-bottom: 8px;
        }
        .section-header p {
          color: var(--text-secondary);
        }
        .bookings-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .booking-card {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 24px;
          align-items: center;
          padding: 24px;
        }
        .booking-status-col {
          display: flex;
          justify-content: center;
        }
        .status-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          min-width: 100px;
          text-align: center;
        }
        .status-indicator.checked {
          background: rgba(16, 185, 129, 0.08);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.15);
        }
        .status-indicator.active {
          background: rgba(99, 102, 241, 0.08);
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.15);
        }
        .status-icon {
          width: 20px;
          height: 20px;
        }
        .booking-event-category {
          color: var(--primary);
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
          display: inline-block;
        }
        .booking-event-title {
          font-size: 1.25rem;
          color: #fff;
          margin-bottom: 10px;
        }
        .booking-meta-row {
          display: flex;
          gap: 20px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 12px;
          flex-wrap: wrap;
        }
        .booking-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .booking-details-row {
          display: flex;
          gap: 12px;
          font-size: 0.9rem;
          color: var(--text-secondary);
          align-items: center;
        }
        .transaction-id code {
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
        }
        @media (max-width: 768px) {
          .booking-card {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 16px;
          }
          .booking-meta-row {
            justify-content: center;
          }
          .booking-details-row {
            justify-content: center;
          }
          .status-indicator {
            min-width: 140px;
          }
          .booking-action-col .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default MyBookings;
