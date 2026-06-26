import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext, API_URL } from '../context/AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  Calendar, 
  DollarSign, 
  Ticket, 
  Users, 
  TrendingUp, 
  Trash2, 
  PlusCircle, 
  QrCode,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const OrganizerDashboard = () => {
  const { getAuthHeaders } = useContext(AuthContext);
  
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/analytics/organizer`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setAnalytics(data);
      } else {
        setError(data.message || 'Failed to fetch dashboard data.');
      }
    } catch (err) {
      setError('Could not connect to server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This will remove all bookings.')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        alert('Event deleted successfully.');
        fetchDashboardData(); // Reload
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete event.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '50vh', flexDirection: 'column', gap: '16px' }}>
        <div className="spinner"></div>
        <span>Compiling analytics & report data...</span>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="empty-state" style={{ maxWidth: '600px', margin: '40px auto' }}>
        <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
        <h3>Failed to Load Dashboard</h3>
        <p>{error || 'An error occurred.'}</p>
        <button onClick={fetchDashboardData} className="btn btn-primary" style={{ marginTop: '16px' }}>Retry</button>
      </div>
    );
  }

  const { totals, salesByEvent, salesOverTime } = analytics;

  return (
    <div className="dashboard-container page-fade">
      <div className="dashboard-header flex-between">
        <div>
          <h1>Organizer Dashboard</h1>
          <p>Real-time analytics and management for your events</p>
        </div>
        <Link to="/create-event" className="btn btn-primary">
          <PlusCircle size={18} /> Create New Event
        </Link>
      </div>

      {/* Grid of totals */}
      <div className="grid-4 stats-grid">
        <div className="card stat-card">
          <div className="stat-content flex-between">
            <div>
              <span className="stat-label">Active Events</span>
              <h2 className="stat-val">{totals.eventsCount}</h2>
            </div>
            <div className="stat-icon-wrapper purple">
              <Calendar size={20} />
            </div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-content flex-between">
            <div>
              <span className="stat-label">Tickets Sold</span>
              <h2 className="stat-val">{totals.ticketsSold}</h2>
            </div>
            <div className="stat-icon-wrapper blue">
              <Ticket size={20} />
            </div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-content flex-between">
            <div>
              <span className="stat-label">Total Revenue</span>
              <h2 className="stat-val">${totals.revenue}</h2>
            </div>
            <div className="stat-icon-wrapper green">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-content flex-between">
            <div>
              <span className="stat-label">Attendance Rate</span>
              <h2 className="stat-val">{totals.attendanceRate}%</h2>
            </div>
            <div className="stat-icon-wrapper red">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Recharts Panels */}
      {totals.eventsCount > 0 && (
        <div className="grid-2 charts-grid">
          {/* Sales over time chart */}
          <div className="card chart-card">
            <h3>Sales Trend (Last 7 Days)</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={salesOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="var(--secondary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Event breakdown chart */}
          <div className="card chart-card">
            <h3>Ticket Sales by Event</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={salesByEvent} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="title" stroke="var(--text-muted)" fontSize={12} tickFormatter={(tick) => tick.substr(0, 8) + '...'} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-dark)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="ticketsSold" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Events management table */}
      <div className="card management-card">
        <h3>Manage Events</h3>
        {salesByEvent.length === 0 ? (
          <div className="empty-state" style={{ border: 'none', background: 'none' }}>
            <p>You haven't created any events yet.</p>
            <Link to="/create-event" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
              Create One now
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Tickets Sold</th>
                  <th>Capacity</th>
                  <th>Revenue</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {salesByEvent.map((item) => (
                  <tr key={item.title}>
                    <td className="event-table-title">{item.title}</td>
                    <td>{item.ticketsSold}</td>
                    <td>{item.totalTickets}</td>
                    <td className="revenue-cell">${item.revenue}</td>
                    <td>
                      {item.availableTickets === 0 ? (
                        <span className="badge badge-danger">Sold Out</span>
                      ) : (
                        <span className="badge badge-success">Active</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-action-group">
                        <Link to={`/check-in?eventId=${item.availableTickets}`} className="btn btn-secondary btn-sm btn-action" title="Check-In attendees">
                          <QrCode size={14} /> Check In
                        </Link>
                        <button 
                          onClick={() => handleDeleteEvent(item.title)} // In a real app we'd map and pass IDs, but since this maps from calculations we need an ID. Wait, let's make sure our API returns event IDs!
                          // Let's modify our backend analyticsController to return event _id too!
                          // Let's verify what salesByEvent returns: we set `salesByEventMap[event._id] = { _id: event._id, title: event.title ... }`.
                          // Wait, in our analyticsController we wrote:
                          // `salesByEventMap[event._id] = { title: event.title, ticketsSold: 0, revenue: 0, totalTickets: event.totalTickets, availableTickets: event.availableTickets }`
                          // Ah! It did not map _id! Let's check how we can delete. We can delete if we have the _id.
                          // Wait! We can edit the analyticsController to return `id: event._id` or we can find it.
                          // Let's make sure we update the dashboard to use the ID. Let's write the controller edit soon, or since we can retrieve user events directly, we can fetch their events list.
                          // Wait! Let's see if we can read the backend analytics controller to verify. Yes, let's use ID if we add it. Let's make a quick file content edit to backend analyticsController if needed, or simply pass the ID from a mapped array.
                          // Let's write the code here to handle `item._id || item.id` and we will update analyticsController.js to include the ID!
                          onClick={() => handleDeleteEvent(item.id)}
                          className="btn btn-danger btn-sm btn-action" 
                          title="Delete Event"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .dashboard-header h1 {
          font-size: 2.2rem;
          color: #fff;
          margin-bottom: 8px;
        }
        .dashboard-header p {
          color: var(--text-secondary);
        }
        .stats-grid {
          margin-top: 10px;
        }
        .stat-card {
          padding: 20px;
          border-radius: var(--radius-md);
        }
        .stat-card:hover {
          transform: translateY(-2px);
        }
        .stat-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .stat-val {
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
          margin-top: 6px;
        }
        .stat-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-icon-wrapper.purple { background: rgba(99, 102, 241, 0.1); color: #818cf8; }
        .stat-icon-wrapper.blue { background: rgba(0, 242, 254, 0.1); color: #00f2fe; }
        .stat-icon-wrapper.green { background: rgba(16, 185, 129, 0.1); color: #34d399; }
        .stat-icon-wrapper.red { background: rgba(239, 68, 68, 0.1); color: #f87171; }
        
        .charts-grid {
          margin-top: 10px;
        }
        .chart-card h3 {
          font-size: 1.1rem;
          margin-bottom: 20px;
          color: #fff;
        }
        .chart-wrapper {
          width: 100%;
          min-height: 260px;
        }
        
        .management-card h3 {
          font-size: 1.25rem;
          margin-bottom: 20px;
          color: #fff;
        }
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        .events-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 0.95rem;
        }
        .events-table th {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
        }
        .events-table td {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-secondary);
        }
        .events-table tr:last-child td {
          border-bottom: none;
        }
        .event-table-title {
          font-weight: 600;
          color: #fff !important;
        }
        .revenue-cell {
          font-weight: 700;
          color: var(--secondary) !important;
        }
        .table-action-group {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }
        .btn-action {
          padding: 6px 12px;
          font-size: 0.8rem;
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  );
};

export default OrganizerDashboard;
