const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getOrganizerEvents
} = require('../controllers/eventController');
const { protect, organizerOnly } = require('../middleware/authMiddleware');

router.get('/', getEvents);
router.get('/organizer/my-events', protect, organizerOnly, getOrganizerEvents);
router.get('/:id', getEventById);
router.post('/', protect, organizerOnly, createEvent);
router.put('/:id', protect, organizerOnly, updateEvent);
router.delete('/:id', protect, organizerOnly, deleteEvent);

module.exports = router;
