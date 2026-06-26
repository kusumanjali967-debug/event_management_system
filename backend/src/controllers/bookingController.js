const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Create a new booking (pending payment)
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const { eventId, ticketsCount } = req.body;

  try {
    if (!eventId || !ticketsCount) {
      return res.status(400).json({ message: 'Event ID and tickets count are required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.availableTickets < ticketsCount) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }

    const totalAmount = event.price * ticketsCount;

    // Deduct available tickets
    event.availableTickets -= ticketsCount;
    await event.save();

    const booking = await Booking.create({
      user: req.user.id,
      event: eventId,
      ticketsCount,
      totalAmount,
      paymentStatus: 'pending'
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process mock payment for a booking
// @route   POST /api/bookings/:id/pay
// @access  Private
const payBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('event');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to pay for this booking' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Booking is already paid' });
    }

    // Simulate payment process
    // In a real app, Stripe SDK would be used here.
    booking.paymentStatus = 'paid';
    booking.paymentId = 'mock_tx_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    await booking.save();

    res.json({
      message: 'Payment successful',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('event')
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Allow user who made the booking OR the organizer of the event to view it
    const isOwner = booking.user._id.toString() === req.user.id;
    const isOrganizer = booking.event.organizer.toString() === req.user.id;

    if (!isOwner && !isOrganizer) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check-in ticket (Organizer only)
// @route   POST /api/bookings/check-in/:bookingId
// @access  Private/Organizer
const checkInTicket = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const booking = await Booking.findById(bookingId).populate('event');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify if logged-in user is organizer of the event
    if (booking.event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized. You are not the organizer of this event' });
    }

    if (booking.paymentStatus !== 'paid') {
      return res.status(400).json({ message: 'Cannot check in. Payment is not completed' });
    }

    if (booking.checkInStatus.checkedIn) {
      return res.status(400).json({ 
        message: 'Ticket already checked in', 
        checkInTime: booking.checkInStatus.checkInTime 
      });
    }

    // Mark as checked in
    booking.checkInStatus.checkedIn = true;
    booking.checkInStatus.checkInTime = new Date();
    await booking.save();

    res.json({
      message: 'Check-in successful!',
      booking
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bookings for a specific event (Organizer only)
// @route   GET /api/bookings/event/:eventId
// @access  Private/Organizer
const getBookingsByEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Verify if logged-in user is organizer of the event
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized. You are not the organizer of this event' });
    }

    const bookings = await Booking.find({ event: eventId, paymentStatus: 'paid' })
      .populate('user', 'name email')
      .sort({ bookingDate: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  payBooking,
  getMyBookings,
  getBookingById,
  checkInTicket,
  getBookingsByEvent
};
