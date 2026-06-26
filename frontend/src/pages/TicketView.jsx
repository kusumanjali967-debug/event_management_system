import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext, API_URL } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, MapPin, User, Ticket, CheckCircle, Clock, ArrowLeft, Download } from 'lucide-react';

const TicketView = () => {
  const { id } = useParams();
  const { getAuthHeaders } = useContext(AuthContext);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bookings/${id}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setBooking(data);
      } else {
        setError(data.message || 'Failed to load ticket.');
      }
    } catch (err) {
      setError('Could not connect to server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '50vh', flexDirection: 'column', gap: '16px' }}>
        <div className="spinner"></div>
        <span>Generating your ticket stub...</span>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="empty-state" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <h3>Error Loading Ticket</h3>
        <p>{error || 'Ticket could not be found.'}</p>
        <Link to="/bookings" className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to My Tickets
        </Link>
      </div>
    );
  }

  const { event, user: attendee, ticketsCount, totalAmount, checkInStatus } = booking;

  return (
    <div className="ticket-view-container page-fade">
      <div className="ticket-view-header flex-between">
        <Link to="/bookings" className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} /> Back to Bookings
        </Link>
        <button onClick={handlePrint} className="btn btn-secondary btn-sm">
          <Download size={16} /> Print/Save PDF
        </button>
      </div>

      {/* Premium Perforated Ticket Design */}
      <div className="ticket-card-wrapper">
        <div className="ticket-main-body">
          <div className="ticket-header">
            <span className="ticket-event-category">{event.category}</span>
            <div className="ticket-booking-id">
              BOOKING REF: <code>{booking._id.toUpperCase()}</code>
            </div>
          </div>

          <h1 className="ticket-title">{event.title}</h1>

          <div className="ticket-details-grid">
            <div className="ticket-detail-item">
              <Calendar className="ticket-item-icon" />
              <div>
                <label>Date & Time</label>
                <span>{formatDate(event.date)} at {event.time}</span>
              </div>
            </div>

            <div className="ticket-detail-item">
              <MapPin className="ticket-item-icon" />
              <div>
                <label>Location</label>
                <span>{event.location}</span>
              </div>
            </div>

            <div className="ticket-detail-item">
              <User className="ticket-item-icon" />
              <div>
                <label>Attendee Name</label>
                <span>{attendee.name}</span>
              </div>
            </div>

            <div className="ticket-detail-item">
              <Ticket className="ticket-item-icon" />
              <div>
                <label>Tickets count</label>
                <span>{ticketsCount} x Standard Entry</span>
              </div>
            </div>
          </div>

          <div className="ticket-footer flex-between">
            <div>
              <label className="footer-label">Paid amount</label>
              <span className="footer-amount">${totalAmount} USD</span>
            </div>

            <div className="ticket-status-badge-container">
              {checkInStatus.checkedIn ? (
                <div className="checkin-stamp success">
                  <CheckCircle size={14} /> Checked-In
                </div>
              ) : (
                <div className="checkin-stamp pending">
                  <Clock size={14} /> Valid Entry
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Perforated separator */}
        <div className="ticket-perforation">
          <div className="notch top"></div>
          <div className="dots"></div>
          <div className="notch bottom"></div>
        </div>

        {/* Side stub containing QR Code */}
        <div className="ticket-stub-body">
          <div className="qr-container">
            <QRCodeSVG 
              value={booking._id} 
              size={150} 
              bgColor="rgba(255,255,255,0.02)" 
              fgColor="#ffffff" 
              level="M" 
              includeMargin={true}
            />
          </div>
          <p className="qr-caption">Scan code for check-in</p>
          <div className="stub-sub-text">
            <span>Scan at entry gate for instant validation. Only valid for {ticketsCount} admissions.</span>
          </div>
        </div>
      </div>

      <style>{`
        .ticket-view-container {
          max-width: 950px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .ticket-card-wrapper {
          display: grid;
          grid-template-columns: 2.3fr auto 1fr;
          background: #111122;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md), 0 0 30px rgba(99, 102, 241, 0.05);
          overflow: hidden;
        }
        
        /* Main Body */
        .ticket-main-body {
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ticket-event-category {
          color: var(--primary);
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .ticket-booking-id {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .ticket-booking-id code {
          background: rgba(255, 255, 255, 0.05);
          padding: 3px 6px;
          border-radius: 4px;
          color: var(--text-secondary);
        }
        .ticket-title {
          font-size: 2rem;
          color: #fff;
          margin-bottom: 10px;
          line-height: 1.2;
          background: none;
          -webkit-text-fill-color: initial;
        }
        .ticket-details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px 40px;
          margin: 10px 0;
        }
        .ticket-detail-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .ticket-item-icon {
          color: var(--primary);
          width: 18px;
          height: 18px;
          margin-top: 2px;
        }
        .ticket-detail-item label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 4px;
          letter-spacing: 0.02em;
        }
        .ticket-detail-item span {
          font-size: 0.95rem;
          color: var(--text-primary);
          font-weight: 600;
        }
        .ticket-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 24px;
          margin-top: 10px;
        }
        .footer-label {
          display: block;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .footer-amount {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--secondary);
        }
        
        /* Checkin Stamps */
        .checkin-stamp {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .checkin-stamp.success {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .checkin-stamp.pending {
          background: rgba(99, 102, 241, 0.1);
          color: #6366f1;
          border: 1px solid rgba(99, 102, 241, 0.2);
        }
        
        /* Perforated separator */
        .ticket-perforation {
          position: relative;
          width: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
        }
        .notch {
          width: 20px;
          height: 20px;
          background: var(--bg-deep);
          border-radius: 50%;
          position: absolute;
          z-index: 10;
        }
        .notch.top {
          top: -10px;
          border-bottom: 1px solid var(--border-color);
        }
        .notch.bottom {
          bottom: -10px;
          border-top: 1px solid var(--border-color);
        }
        .dots {
          height: 100%;
          border-left: 2px dashed rgba(255, 255, 255, 0.08);
          margin-left: -1px;
        }
        
        /* Side Stub */
        .ticket-stub-body {
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.01);
          gap: 16px;
        }
        .qr-container {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .qr-caption {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 600;
        }
        .stub-sub-text {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: center;
          line-height: 1.4;
        }
        
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .ticket-card-wrapper {
            background: white !important;
            color: black !important;
            border: 1px solid #ddd !important;
            box-shadow: none !important;
          }
          .notch {
            background: white !important;
          }
          .ticket-view-header, nav, footer {
            display: none !important;
          }
          .ticket-title {
            color: black !important;
          }
          .ticket-booking-id code, .stub-sub-text, .qr-caption, .ticket-detail-item span, .footer-amount {
            color: black !important;
          }
        }
        
        @media (max-width: 800px) {
          .ticket-card-wrapper {
            grid-template-columns: 1fr;
          }
          .ticket-perforation {
            height: 20px;
            width: 100%;
            flex-direction: row;
            justify-content: space-between;
          }
          .notch.top {
            left: -10px;
            top: 0;
            border-right: 1px solid var(--border-color);
          }
          .notch.bottom {
            right: -10px;
            bottom: 0;
            top: 0;
            border-left: 1px solid var(--border-color);
          }
          .dots {
            width: 100%;
            height: 1px;
            border-top: 2px dashed rgba(255, 255, 255, 0.08);
            border-left: none;
            margin-left: 0;
            margin-top: -1px;
          }
          .ticket-stub-body {
            padding: 30px;
          }
        }
      `}</style>
    </div>
  );
};

export default TicketView;
