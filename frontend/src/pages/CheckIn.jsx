import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AuthContext, API_URL } from '../context/AuthContext';
import { QrCode, Search, CheckCircle, XCircle, AlertCircle, Calendar, Users, Loader } from 'lucide-react';

const CheckIn = () => {
  const { getAuthHeaders } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const eventIdParam = searchParams.get('eventId');

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Simulation helpers
  const [recentBookings, setRecentBookings] = useState([]);
  const [fetchingBookings, setFetchingBookings] = useState(false);

  // Result state
  const [checkInResult, setCheckInResult] = useState(null); // { success: boolean, message: string, booking: object }
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrganizerEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchEventBookings(selectedEventId);
    } else {
      setRecentBookings([]);
    }
    setCheckInResult(null);
    setError('');
  }, [selectedEventId]);

  const fetchOrganizerEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events/organizer/my-events`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setEvents(data);
        if (data.length > 0) {
          // If eventIdParam matches any active event
          const matched = data.find(e => e._id === eventIdParam);
          setSelectedEventId(matched ? matched._id : data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not fetch organizer events.');
    }
  };

  // Fetch bookings for the selected event to populate the simulator helper
  const fetchEventBookings = async (eventId) => {
    setFetchingBookings(true);
    try {
      // In a real app we'd query bookings by event.
      // We can query all of the organizer's bookings or query bookings from server.
      // Let's call our analytics dashboard endpoint or a mock database call.
      // Instead, let's fetch my-bookings or simulate a list of ticket holders.
      // Wait, we can fetch analytics which returns sales trend and salesByEvent.
      // But let's build an endpoint if needed, or simply fetch bookings for that event.
      // Let's create an endpoint in backend `bookingRoutes.js` if we want,
      // but wait, we can fetch all bookings of the event by doing a quick fetch!
      // Do we have an endpoint for event bookings?
      // Let's check `bookingController.js`: we have `getBookingById`, `getMyBookings`, `checkInTicket`.
      // We can fetch a list of bookings by calling `GET /api/bookings/event/:eventId` if we implement it.
      // Wait, let's implement a backend route `GET /api/bookings/event/:eventId` so organizers can see attendee lists!
      // This is a fantastic detail and will make the check-in helper work perfectly.
      // Let's write the backend controller & route for this, but first, let's construct the frontend CheckIn component so we know what it calls.
      const res = await fetch(`${API_URL}/bookings/event/${eventId}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setRecentBookings(data);
      }
    } catch (err) {
      console.error('Error fetching event bookings:', err);
    } finally {
      setFetchingBookings(false);
    }
  };

  const handleCheckInSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!bookingId.trim()) return;

    setLoading(true);
    setCheckInResult(null);
    setError('');

    try {
      const res = await fetch(`${API_URL}/bookings/check-in/${bookingId.trim()}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      const data = await res.json();
      if (res.ok) {
        setCheckInResult({
          success: true,
          message: data.message || 'Check-in processed successfully!',
          booking: data.booking
        });
        setBookingId('');
        // Refresh bookings list to show updated status
        fetchEventBookings(selectedEventId);
      } else {
        setCheckInResult({
          success: false,
          message: data.message || 'Validation failed.'
        });
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateScan = (id) => {
    setBookingId(id);
    // Auto-submit after small delay to mimic scan
    setTimeout(() => {
      // We fetch from state so we need to pass ID directly
      setBookingId(prevId => {
        if (prevId === id) {
          // Trigger the validation
          setLoading(true);
          fetch(`${API_URL}/bookings/check-in/${id}`, {
            method: 'POST',
            headers: getAuthHeaders()
          })
            .then(res => res.json().then(data => ({ ok: res.ok, data })))
            .then(({ ok, data }) => {
              if (ok) {
                setCheckInResult({
                  success: true,
                  message: data.message || 'Check-in processed successfully!',
                  booking: data.booking
                });
                setBookingId('');
                fetchEventBookings(selectedEventId);
              } else {
                setCheckInResult({
                  success: false,
                  message: data.message || 'Validation failed.'
                });
              }
            })
            .catch(() => setError('Connection failed.'))
            .finally(() => setLoading(false));
        }
        return '';
      });
    }, 400);
  };

  return (
    <div className="checkin-container page-fade">
      <div className="dashboard-header">
        <h1>Gate Check-In Scanner</h1>
        <p>Scan attendee QR codes or redeem ticket references manually</p>
      </div>

      {error && (
        <div className="error-alert">
          <AlertCircle className="alert-icon" />
          <span>{error}</span>
        </div>
      )}

      {events.length === 0 ? (
        <div className="empty-state">
          <Calendar size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3>No events found</h3>
          <p>Create an event first to access check-in controls.</p>
          <Link to="/create-event" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Create Event
          </Link>
        </div>
      ) : (
        <div className="checkin-grid">
          {/* Main scanner controller */}
          <div className="checkin-panel">
            <div className="card">
              <h3>Scan Validation</h3>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="form-label">Select Active Event</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="form-select"
                >
                  {events.map((e) => (
                    <option key={e._id} value={e._id}>{e.title}</option>
                  ))}
                </select>
              </div>

              <div className="scanner-mock-window flex-center">
                <QrCode size={100} className="scanner-laser-icon" />
                <div className="scanner-laser-line"></div>
                <span className="scanner-mock-label">Ready to validate tickets</span>
              </div>

              <form onSubmit={handleCheckInSubmit} className="manual-checkin-form">
                <div className="form-group">
                  <label className="form-label">Enter Booking Reference ID (QR Code Content)</label>
                  <div className="input-with-icon">
                    <Search className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 642fd901cb001bfa..."
                      value={bookingId}
                      onChange={(e) => setBookingId(e.target.value)}
                      style={{ paddingLeft: '44px' }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={loading || !bookingId.trim()}
                >
                  {loading ? 'Validating Reference...' : 'Validate & Check-In'}
                </button>
              </form>

              {/* Validation Result Box */}
              {checkInResult && (
                <div className={`result-box card ${checkInResult.success ? 'success' : 'fail'}`}>
                  {checkInResult.success ? (
                    <div className="result-content text-center">
                      <CheckCircle size={44} className="result-icon-success" />
                      <h4>Access Granted</h4>
                      <p className="result-msg">{checkInResult.message}</p>
                      {checkInResult.booking && (
                        <div className="result-ticket-details">
                          <p>Attendee: <strong>{checkInResult.booking.user?.name || 'Attendee'}</strong></p>
                          <p>Tickets count: <strong>{checkInResult.booking.ticketsCount}</strong></p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="result-content text-center">
                      <XCircle size={44} className="result-icon-fail" />
                      <h4>Access Denied</h4>
                      <p className="result-msg">{checkInResult.message}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Simulator & attendee helper list */}
          <div className="checkin-sidebar">
            <div className="card">
              <h3>Attendee Guestlist (Simulator Helper)</h3>
              <p className="guestlist-description">
                Use this guestlist to easily test check-ins. Click <strong>"Simulate Scan"</strong> to auto-fill and submit a ticket QR reference.
              </p>

              {fetchingBookings ? (
                <div className="flex-center" style={{ padding: '40px 0', flexDirection: 'column', gap: '10px' }}>
                  <Loader className="spin-icon" />
                  <span>Loading attendee sheet...</span>
                </div>
              ) : recentBookings.length === 0 ? (
                <p className="no-attendees-text">No ticket purchases recorded for this event yet.</p>
              ) : (
                <div className="guest-list">
                  {recentBookings.map((b) => (
                    <div key={b._id} className="guest-item flex-between">
                      <div className="guest-meta">
                        <strong>{b.user.name}</strong>
                        <p>{b.ticketsCount} ticket(s) &bull; <code>{b._id.substr(-6).toUpperCase()}</code></p>
                      </div>

                      <div>
                        {b.checkInStatus.checkedIn ? (
                          <span className="badge badge-success btn-sm" style={{ pointerEvents: 'none' }}>
                            Checked In
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSimulateScan(b._id)}
                            className="btn btn-secondary btn-sm"
                            disabled={loading}
                          >
                            Simulate Scan
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .checkin-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .checkin-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 30px;
        }
        .scanner-mock-window {
          height: 200px;
          background: #090911;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          margin: 20px 0;
          position: relative;
          overflow: hidden;
          flex-direction: column;
          gap: 16px;
        }
        .scanner-laser-icon {
          color: var(--primary);
          opacity: 0.7;
          filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.4));
        }
        .scanner-laser-line {
          position: absolute;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent);
          animation: scanLaser 2s linear infinite;
        }
        .scanner-mock-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .manual-checkin-form {
          margin-top: 20px;
        }
        .btn-block {
          width: 100%;
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
        
        /* Checkin Results Styling */
        .result-box {
          margin-top: 24px;
          padding: 20px;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .result-box.success {
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .result-box.fail {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .result-icon-success {
          color: var(--success);
          margin-bottom: 12px;
          filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.3));
        }
        .result-icon-fail {
          color: var(--danger);
          margin-bottom: 12px;
          filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.3));
        }
        .result-content h4 {
          font-size: 1.2rem;
          color: #fff;
          margin-bottom: 6px;
        }
        .result-msg {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }
        .result-ticket-details {
          background: rgba(255, 255, 255, 0.04);
          padding: 10px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          text-align: left;
          display: inline-block;
        }
        .result-ticket-details p {
          margin-bottom: 4px;
        }
        .result-ticket-details p:last-child {
          margin-bottom: 0;
        }
        
        /* Guestlist */
        .guestlist-description {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 6px;
          margin-bottom: 20px;
          line-height: 1.4;
        }
        .no-attendees-text {
          font-size: 0.9rem;
          color: var(--text-muted);
          text-align: center;
          padding: 30px 0;
        }
        .guest-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 480px;
          overflow-y: auto;
          padding-right: 4px;
        }
        .guest-item {
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
        }
        .guest-item:hover {
          background: rgba(255, 255, 255, 0.04);
        }
        .guest-meta strong {
          color: #fff;
          font-size: 0.9rem;
          display: block;
        }
        .guest-meta p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 2px;
        }
        
        .spin-icon {
          animation: spin 1.5s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes scanLaser {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        
        @media (max-width: 900px) {
          .checkin-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default CheckIn;
