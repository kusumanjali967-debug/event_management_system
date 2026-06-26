const express = require('express');
const router = express.Router();
const {
  createBooking,
  payBooking,
  getMyBookings,
  getBookingById,
  checkInTicket,
  getBookingsByEvent
} = require('../controllers/bookingController');
const { protect, organizerOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.post('/:id/pay', protect, payBooking);
router.get('/my-bookings', protect, getMyBookings);
router.post('/check-in/:bookingId', protect, organizerOnly, checkInTicket);
router.get('/event/:eventId', protect, organizerOnly, getBookingsByEvent);
router.get('/:id', protect, getBookingById);

module.exports = router;
