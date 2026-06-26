import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext, API_URL } from '../context/AuthContext';
import { Search, Calendar as CalendarIcon, MapPin, Tag, ArrowRight } from 'lucide-react';

const CATEGORIES = ['All', 'Music', 'Tech', 'Sports', 'Arts', 'Business', 'Food', 'Others'];

const Home = () => {
  const { user } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchEvents();
  }, [category]); // Fetch on category change

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/events?`;
      if (category && category !== 'All') {
        url += `category=${category}&`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok) {
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEventsWithSearch();
  };

  const fetchEventsWithSearch = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/events?search=${search}`;
      if (category && category !== 'All') {
        url += `&category=${category}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setEvents(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="home-container page-fade">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow"></div>
        <h1 className="hero-title">
          Unforgettable Events, <br />
          <span className="gradient-text">Seamless Experiences.</span>
        </h1>
        <p className="hero-subtitle">
          Find concerts, conferences, sports events, and local workshops. Secure your ticket and check in instantly.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="search-bar-form">
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by event title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" className="btn btn-primary">Find Events</button>
        </form>
      </section>

      {/* Category Navigation */}
      <section className="category-section">
        <div className="category-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`category-tab ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Events Grid */}
      <section className="events-section">
        <div className="section-header flex-between">
          <h2>Popular Events</h2>
          {category !== 'All' && <span className="badge badge-info">{category}</span>}
        </div>

        {loading ? (
          <div className="loading-state flex-center">
            <div className="spinner"></div>
            <span>Loading active events...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <p>No events found. Be the first to create one!</p>
            {user?.role === 'organizer' && (
              <Link to="/create-event" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Publish Event <ArrowRight size={16} />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid-3">
            {events.map((event) => (
              <div key={event._id} className="card event-card">
                <div className="event-card-banner">
                  {event.image ? (
                    <img src={event.image} alt={event.title} className="event-banner-img" />
                  ) : (
                    <div className="event-banner-placeholder flex-center">
                      <Tag className="placeholder-icon" />
                      <span>{event.category}</span>
                    </div>
                  )}
                  <div className="event-price-tag">
                    {event.price === 0 ? 'FREE' : `$${event.price}`}
                  </div>
                </div>

                <div className="event-card-body">
                  <span className="event-card-category">{event.category}</span>
                  <h3 className="event-card-title">{event.title}</h3>
                  
                  <div className="event-meta-info">
                    <div className="meta-item">
                      <CalendarIcon className="meta-icon" />
                      <span>{formatDate(event.date)} at {event.time}</span>
                    </div>
                    <div className="meta-item">
                      <MapPin className="meta-icon" />
                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="event-card-footer flex-between">
                    <span className={`ticket-availability ${event.availableTickets === 0 ? 'sold-out' : ''}`}>
                      {event.availableTickets === 0 
                        ? 'Sold Out' 
                        : `${event.availableTickets} tickets left`}
                    </span>
                    <Link to={`/events/${event._id}`} className="btn btn-primary btn-sm btn-icon">
                      Details <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style>{`
        .home-container {
          display: flex;
          flex-direction: column;
          gap: 60px;
        }
        .hero-section {
          text-align: center;
          padding: 80px 20px;
          border-radius: var(--radius-lg);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          position: relative;
          overflow: hidden;
        }
        .hero-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          background: var(--primary);
          filter: blur(120px);
          opacity: 0.15;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
        }
        .hero-title {
          font-size: 3rem;
          line-height: 1.2;
          margin-bottom: 20px;
        }
        .gradient-text {
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          color: var(--text-secondary);
          font-size: 1.15rem;
          max-width: 600px;
          margin: 0 auto 40px;
        }
        .search-bar-form {
          display: flex;
          max-width: 600px;
          margin: 0 auto;
          gap: 12px;
          background: rgba(15, 15, 25, 0.8);
          padding: 8px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-md);
        }
        .search-input-wrapper {
          position: relative;
          flex-grow: 1;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          width: 20px;
          height: 20px;
          color: var(--text-muted);
        }
        .search-input {
          width: 100%;
          border: none;
          background: none;
          color: #fff;
          font-size: 1rem;
          padding: 12px 12px 12px 48px;
          outline: none;
        }
        .category-tabs {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 8px;
          scrollbar-width: none; /* Firefox */
        }
        .category-tabs::-webkit-scrollbar {
          display: none; /* Safari/Chrome */
        }
        .category-tab {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 10px 20px;
          border-radius: var(--radius-full);
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: var(--transition);
          white-space: nowrap;
        }
        .category-tab:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
        }
        .category-tab.active {
          background: var(--primary-gradient);
          color: #fff;
          border-color: transparent;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.25);
        }
        .section-header h2 {
          font-size: 1.8rem;
          margin-bottom: 0;
        }
        .event-card {
          padding: 0;
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .event-card-banner {
          position: relative;
          height: 200px;
          width: 100%;
          overflow: hidden;
          background: #1e1e2f;
        }
        .event-banner-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition);
        }
        .event-card:hover .event-banner-img {
          transform: scale(1.05);
        }
        .event-banner-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1e1b4b 0%, #311042 100%);
          color: var(--text-secondary);
          font-weight: 700;
          font-size: 1.2rem;
          flex-direction: column;
          gap: 12px;
        }
        .placeholder-icon {
          width: 40px;
          height: 40px;
          color: var(--primary);
        }
        .event-price-tag {
          position: absolute;
          top: 14px;
          right: 14px;
          background: rgba(13, 13, 24, 0.85);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          font-weight: 700;
          font-size: 0.9rem;
          color: #fff;
        }
        .event-card-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }
        .event-card-category {
          color: var(--primary);
          font-size: 0.8rem;
          text-transform: uppercase;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        .event-card-title {
          font-size: 1.25rem;
          margin-bottom: 16px;
          color: #fff;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          min-height: 3rem;
        }
        .event-meta-info {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .meta-icon {
          width: 16px;
          height: 16px;
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .ticket-availability {
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .ticket-availability.sold-out {
          color: var(--danger);
          font-weight: 700;
        }
        .loading-state {
          flex-direction: column;
          gap: 16px;
          padding: 60px 0;
          color: var(--text-secondary);
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(99, 102, 241, 0.1);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-secondary);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 600px) {
          .hero-title { font-size: 2.2rem; }
          .search-bar-form { flex-direction: column; background: none; border: none; box-shadow: none; padding: 0; }
          .search-input-wrapper { background: rgba(15, 15, 25, 0.8); border: 1px solid var(--border-color); border-radius: var(--radius-md); width: 100%; }
          .search-bar-form .btn { width: 100%; padding: 14px; }
        }
      `}</style>
    </div>
  );
};

export default Home;
