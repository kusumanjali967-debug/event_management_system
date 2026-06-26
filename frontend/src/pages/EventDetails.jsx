import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext, API_URL } from '../context/AuthContext';
import { 
  Calendar, 
  MapPin, 
  Tag, 
  Ticket, 
  AlertTriangle, 
  CreditCard, 
  CheckCircle,
  X,
  Lock,
  Loader
} from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getAuthHeaders } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Booking states
  const [ticketCount, setTicketCount] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);

  // Payment states
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/events/${id}`);
      const data = await res.json();
      if (res.ok) {
        setEvent(data);
      } else {
        setError(data.message || 'Failed to fetch event details.');
      }
    } catch (err) {
      setError('Could not connect to server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'attendee') {
      alert('Only attendees can book tickets.');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          eventId: event._id,
          ticketsCount: ticketCount
        })
      });

      const data = await res.json();
      if (res.ok) {
        setActiveBooking(data);
        setShowPaymentModal(true);
      } else {
        alert(data.message || 'Booking creation failed.');
      }
    } catch (err) {
      console.error(err);
      alert('Could not book event.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCardChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentError('');
    setPaymentLoading(true);

    // Simulate checking credit card credentials
    setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/bookings/${activeBooking._id}/pay`, {
          method: 'POST',
          headers: getAuthHeaders()
        });

        const data = await res.json();
        if (res.ok) {
          setPaymentSuccess(true);
          // Refetch event to update available tickets count
          fetchEventDetails();
          setTimeout(() => {
            setShowPaymentModal(false);
            navigate('/bookings');
          }, 2000);
        } else {
          setPaymentError(data.message || 'Payment simulation failed.');
        }
      } catch (err) {
        console.error(err);
        setPaymentError('Server connection error during payment.');
      } finally {
        setPaymentLoading(false);
      }
    }, 2000); // 2 second mock delay
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '50vh', flexDirection: 'column', gap: '16px' }}>
        <div className="spinner"></div>
        <span>Loading event details...</span>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="empty-state" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
        <h3>Error Loading Event</h3>
        <p>{error || 'Event not found.'}</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Explore</Link>
      </div>
    );
  }

  const isOrganizer = user && user.role === 'organizer' && event.organizer._id === user._id;

  return (
    <div className="event-details-container page-fade">
      <div className="details-grid">
        {/* Banner and info */}
        <div className="details-main">
          <div className="details-banner">
            {event.image ? (
              <img src={event.image} alt={event.title} className="details-banner-img" />
            ) : (
              <div className="details-banner-placeholder flex-center">
                <Tag size={48} />
                <span>{event.category} Event</span>
              </div>
            )}
            <span className="details-category-badge">{event.category}</span>
          </div>

          <div className="details-content">
            <h1 className="details-title">{event.title}</h1>
            
            <div className="organizer-info">
              <span>Organized by: <strong>{event.organizer.name}</strong> ({event.organizer.email})</span>
            </div>

            <hr className="divider" />

            <div className="details-description">
              <h3>About this Event</h3>
              <p style={{ whiteSpace: 'pre-line' }}>{event.description}</p>
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="details-sidebar">
          <div className="card sticky-card">
            <h3>Event Details</h3>
            
            <div className="sidebar-meta-list">
              <div className="sidebar-meta-item">
                <Calendar className="meta-icon-sidebar" />
                <div>
                  <strong>Date & Time</strong>
                  <p>{formatDate(event.date)}</p>
                  <p>{event.time}</p>
                </div>
              </div>

              <div className="sidebar-meta-item">
                <MapPin className="meta-icon-sidebar" />
                <div>
                  <strong>Location</strong>
                  <p>{event.location}</p>
                </div>
              </div>

              <div className="sidebar-meta-item">
                <Ticket className="meta-icon-sidebar" />
                <div>
                  <strong>Ticket Price</strong>
                  <p className="sidebar-price">
                    {event.price === 0 ? 'FREE' : `$${event.price}`}
                  </p>
                </div>
              </div>
            </div>

            <hr className="divider" />

            {/* Actions for User role */}
            {isOrganizer ? (
              <div className="organizer-badge-panel flex-center">
                <AlertTriangle size={18} />
                <span>You are the organizer of this event. Manage registrations via the Dashboard.</span>
              </div>
            ) : event.availableTickets === 0 ? (
              <div className="sold-out-alert text-center">
                <h4>Sold Out</h4>
                <p>Sorry, all tickets have been booked for this event.</p>
              </div>
            ) : (
              <div className="booking-action-panel">
                <div className="form-group flex-between">
                  <label className="form-label" style={{ marginBottom: 0 }}>Quantity</label>
                  <select 
                    value={ticketCount} 
                    onChange={(e) => setTicketCount(parseInt(e.target.value))}
                    className="form-select qty-select"
                  >
                    {[...Array(Math.min(10, event.availableTickets)).keys()].map((n) => (
                      <option key={n + 1} value={n + 1}>{n + 1}</option>
                    ))}
                  </select>
                </div>

                <div className="price-breakdown flex-between">
                  <span>Total Amount</span>
                  <span className="price-total">
                    {event.price === 0 ? 'FREE' : `$${event.price * ticketCount}`}
                  </span>
                </div>

                <button 
                  onClick={handleBookNow} 
                  className="btn btn-primary btn-block"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Processing Booking...' : 'Book Tickets'}
                </button>
                
                <p className="security-notice text-center">
                  <Lock size={12} style={{ marginRight: '4px' }} /> Secure checkout simulator
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mock Payment Gateway Modal */}
      {showPaymentModal && activeBooking && (
        <div className="modal-overlay">
          <div className="modal-content payment-modal">
            <button 
              className="modal-close-btn" 
              onClick={() => {
                if (!paymentLoading && !paymentSuccess) setShowPaymentModal(false);
              }}
              disabled={paymentLoading || paymentSuccess}
            >
              <X />
            </button>

            {!paymentSuccess ? (
              <>
                <div className="modal-payment-header">
                  <CreditCard className="header-pay-icon" />
                  <h3>Secure Payment Sandbox</h3>
                  <p>Complete booking for <strong>{event.title}</strong></p>
                </div>

                <div className="payment-total-box flex-between">
                  <span>Booking ID: <code className="booking-code">{activeBooking._id.substr(-6).toUpperCase()}</code></span>
                  <span className="pay-amount">${activeBooking.totalAmount}</span>
                </div>

                {paymentError && (
                  <div className="error-alert">
                    <AlertTriangle size={16} />
                    <span>{paymentError}</span>
                  </div>
                )}

                <form onSubmit={handlePaymentSubmit} className="payment-form">
                  <div className="form-group">
                    <label className="form-label">Name on Card</label>
                    <input 
                      type="text" 
                      name="name" 
                      placeholder="Jane Doe" 
                      className="form-input"
                      value={cardDetails.name}
                      onChange={handleCardChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <input 
                      type="text" 
                      name="number" 
                      placeholder="4111 2222 3333 4444" 
                      maxLength="19"
                      className="form-input"
                      value={cardDetails.number}
                      onChange={handleCardChange}
                      required
                    />
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Expiry Date</label>
                      <input 
                        type="text" 
                        name="expiry" 
                        placeholder="MM/YY" 
                        maxLength="5"
                        className="form-input"
                        value={cardDetails.expiry}
                        onChange={handleCardChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input 
                        type="password" 
                        name="cvv" 
                        placeholder="123" 
                        maxLength="3"
                        className="form-input"
                        value={cardDetails.cvv}
                        onChange={handleCardChange}
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary btn-block btn-pay-now"
                    disabled={paymentLoading}
                  >
                    {paymentLoading ? (
                      <>
                        <Loader className="spin-icon" /> Authenticating Transaction...
                      </>
                    ) : (
                      `Pay $${activeBooking.totalAmount}`
                    )}
                  </button>
                </form>

                <p className="sandbox-disclaimer">
                  * This is a secure sandbox simulator. You can enter any mock card details to process the transaction.
                </p>
              </>
            ) : (
              <div className="payment-success-box text-center">
                <CheckCircle size={60} className="success-check-icon" />
                <h3>Booking Confirmed!</h3>
                <p>Your payment was processed successfully.</p>
                <p className="success-sub">Redirecting you to tickets page...</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .event-details-container {
          padding-top: 20px;
        }
        .details-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 40px;
        }
        .details-main {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .details-banner {
          position: relative;
          height: 380px;
          background: #10101e;
        }
        .details-banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .details-banner-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%);
          color: var(--text-secondary);
          flex-direction: column;
          gap: 16px;
        }
        .details-category-badge {
          position: absolute;
          bottom: 20px;
          left: 20px;
          background: var(--primary-gradient);
          color: #fff;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
        }
        .details-content {
          padding: 40px;
        }
        .details-title {
          font-size: 2.2rem;
          color: #fff;
          margin-bottom: 12px;
          line-height: 1.2;
        }
        .organizer-info {
          font-size: 0.95rem;
          color: var(--text-secondary);
        }
        .divider {
          border: 0;
          height: 1px;
          background: var(--border-color);
          margin: 24px 0;
        }
        .details-description h3 {
          font-size: 1.25rem;
          margin-bottom: 16px;
          color: #fff;
        }
        .details-description p {
          color: var(--text-secondary);
          font-size: 1.05rem;
          line-height: 1.7;
        }
        .sticky-card {
          position: sticky;
          top: 90px;
          background: rgba(20, 20, 35, 0.8);
          border-color: rgba(255, 255, 255, 0.06);
        }
        .sidebar-meta-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 24px;
        }
        .sidebar-meta-item {
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .meta-icon-sidebar {
          color: var(--primary);
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .sidebar-meta-item strong {
          color: #fff;
          font-size: 0.95rem;
          display: block;
          margin-bottom: 4px;
        }
        .sidebar-meta-item p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.4;
        }
        .sidebar-price {
          font-size: 1.5rem !important;
          font-weight: 800;
          color: var(--secondary) !important;
          margin-top: 4px;
        }
        .qty-select {
          width: 80px;
          padding: 8px;
          background: rgba(10, 10, 15, 0.6);
        }
        .price-breakdown {
          margin: 20px 0;
          font-size: 1rem;
          color: var(--text-secondary);
          font-weight: 600;
        }
        .price-total {
          font-size: 1.4rem;
          color: #fff;
          font-weight: 800;
        }
        .organizer-badge-panel {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: var(--radius-sm);
          color: #fbbf24;
          padding: 12px;
          font-size: 0.85rem;
          gap: 10px;
          line-height: 1.4;
        }
        .sold-out-alert {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.15);
          color: #f87171;
          padding: 16px;
          border-radius: var(--radius-md);
        }
        .sold-out-alert h4 {
          font-size: 1.2rem;
          margin-bottom: 6px;
        }
        .security-notice {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Modal payment specifics */
        .payment-modal {
          max-width: 440px;
        }
        .modal-close-btn {
          position: absolute;
          right: 20px;
          top: 20px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: var(--transition);
        }
        .modal-close-btn:hover {
          color: #fff;
        }
        .modal-payment-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .header-pay-icon {
          width: 40px;
          height: 40px;
          color: var(--primary);
          margin-bottom: 12px;
        }
        .modal-payment-header h3 {
          font-size: 1.4rem;
          color: #fff;
          margin-bottom: 4px;
        }
        .modal-payment-header p {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .payment-total-box {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 12px 16px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .booking-code {
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
        }
        .pay-amount {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--secondary);
        }
        .payment-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .btn-pay-now {
          margin-top: 10px;
          font-weight: 700;
        }
        .sandbox-disclaimer {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: center;
          margin-top: 16px;
          line-height: 1.4;
        }
        .payment-success-box {
          padding: 30px 10px;
        }
        .success-check-icon {
          color: var(--success);
          margin-bottom: 20px;
          filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.4));
        }
        .success-sub {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-top: 16px;
        }
        .spin-icon {
          animation: spin 1.5s linear infinite;
          margin-right: 8px;
          width: 18px;
          height: 18px;
        }
        @media (max-width: 900px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
          .details-sidebar {
            order: -1;
          }
          .sticky-card {
            position: static;
          }
          .details-banner {
            height: 240px;
          }
          .details-content {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default EventDetails;
