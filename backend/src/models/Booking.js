const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    ticketsCount: { type: Number, required: true, default: 1 },
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentId: { type: String },
    checkInStatus: {
      checkedIn: { type: Boolean, default: false },
      checkInTime: { type: Date }
    },
    bookingDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
