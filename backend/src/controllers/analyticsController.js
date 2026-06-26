const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Get organizer dashboard analytics
// @route   GET /api/analytics/organizer
// @access  Private/Organizer
const getOrganizerAnalytics = async (req, res) => {
  try {
    // 1. Get all events created by this organizer
    const events = await Event.find({ organizer: req.user.id });
    const eventIds = events.map((event) => event._id);

    if (eventIds.length === 0) {
      return res.json({
        totals: {
          eventsCount: 0,
          ticketsSold: 0,
          revenue: 0,
          checkIns: 0,
          attendanceRate: 0
        },
        salesByEvent: [],
        salesOverTime: []
      });
    }

    // 2. Get all paid bookings for these events
    const bookings = await Booking.find({
      event: { $in: eventIds },
      paymentStatus: 'paid'
    }).populate('event');

    // 3. Compute totals
    const eventsCount = events.length;
    let ticketsSold = 0;
    let revenue = 0;
    let checkIns = 0;

    bookings.forEach((booking) => {
      ticketsSold += booking.ticketsCount;
      revenue += booking.totalAmount;
      if (booking.checkInStatus.checkedIn) {
        checkIns += booking.ticketsCount; // We can count by tickets or bookings
      }
    });

    const attendanceRate = ticketsSold > 0 ? Math.round((checkIns / ticketsSold) * 100) : 0;

    // 4. Sales by Event
    const salesByEventMap = {};
    events.forEach((event) => {
      salesByEventMap[event._id] = {
        id: event._id,
        title: event.title,
        ticketsSold: 0,
        revenue: 0,
        totalTickets: event.totalTickets,
        availableTickets: event.availableTickets
      };
    });

    bookings.forEach((booking) => {
      const eId = booking.event._id.toString();
      if (salesByEventMap[eId]) {
        salesByEventMap[eId].ticketsSold += booking.ticketsCount;
        salesByEventMap[eId].revenue += booking.totalAmount;
      }
    });

    const salesByEvent = Object.values(salesByEventMap);

    // 5. Sales Over Time (Group by Date - last 7 days)
    const salesOverTimeMap = {};
    // Pre-populate last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      salesOverTimeMap[dateStr] = { date: dateStr, tickets: 0, revenue: 0 };
    }

    bookings.forEach((booking) => {
      const dateStr = new Date(booking.bookingDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      if (salesOverTimeMap[dateStr]) {
        salesOverTimeMap[dateStr].tickets += booking.ticketsCount;
        salesOverTimeMap[dateStr].revenue += booking.totalAmount;
      } else {
        // If booking is older than 7 days but we want to show it or keep track
        // For simple representation, we only chart the pre-populated 7 days.
      }
    });

    const salesOverTime = Object.values(salesOverTimeMap);

    res.json({
      totals: {
        eventsCount,
        ticketsSold,
        revenue,
        checkIns,
        attendanceRate
      },
      salesByEvent,
      salesOverTime
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrganizerAnalytics
};
