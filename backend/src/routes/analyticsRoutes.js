const express = require('express');
const router = express.Router();
const { getOrganizerAnalytics } = require('../controllers/analyticsController');
const { protect, organizerOnly } = require('../middleware/authMiddleware');

router.get('/organizer', protect, organizerOnly, getOrganizerAnalytics);

module.exports = router;
