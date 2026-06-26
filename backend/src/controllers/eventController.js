const Event = require('../models/Event');

// @desc    Get all events (filtered or search)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Organizer
const createEvent = async (req, res) => {
  const { title, description, date, time, location, category, price, totalTickets, image } = req.body;

  try {
    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      category,
      price: price || 0,
      totalTickets,
      availableTickets: totalTickets,
      image: image || '',
      organizer: req.user.id
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Organizer
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the user is the organizer of the event
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to update this event' });
    }

    const { title, description, date, time, location, category, price, totalTickets, image } = req.body;

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.time = time || event.time;
    event.location = location || event.location;
    event.category = category || event.category;
    event.image = image || event.image;
    
    if (price !== undefined) event.price = price;
    
    if (totalTickets !== undefined) {
      const ticketsDifference = totalTickets - event.totalTickets;
      event.totalTickets = totalTickets;
      event.availableTickets = Math.max(0, event.availableTickets + ticketsDifference);
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Organizer
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the user is the organizer of the event
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get organizer events
// @route   GET /api/events/organizer/my-events
// @access  Private/Organizer
const getOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user.id }).sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getOrganizerEvents
};
