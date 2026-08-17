# 🎫 Event Management System

A full-stack web application designed to simplify event creation, registration, booking, payment processing, and event check-in.

This project was developed as part of my **3Skills Internship** to gain practical experience in full-stack web development, REST APIs, database management, authentication, and cloud deployment.

---

## 📌 Project Overview

The **Event Management System** provides a centralized platform where users can discover events, register for events, book tickets, and manage their bookings.

Event organizers can create and manage events, monitor registrations, and use QR-based check-in to efficiently manage attendees.

The system follows a modern full-stack architecture with a **React.js frontend**, **Node.js/Express.js backend**, and **MongoDB database**.

---

## ✨ Features

### 👤 User Features

- User registration and login
- JWT-based authentication
- Browse available events
- View event details
- Register for events
- Book event tickets
- Mock payment integration
- View booking history
- Generate QR code for bookings
- QR-based event check-in

### 🎤 Event Management

- Create events
- Update event details
- Delete events
- Manage event capacity
- Track registrations
- View attendee information

### 📊 Admin / Organizer Features

- Event management dashboard
- Registration tracking
- Booking management
- Event analytics
- Attendee management
- QR-based check-in

### 🔐 Security

- JWT authentication
- Protected API routes
- Password protection
- Environment variables for sensitive configuration
- Role-based access control

---

## 🛠️ Technology Stack

### Frontend

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- React Context API

### Backend

- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcrypt

### Database

- MongoDB
- Mongoose

### Other Technologies

- QR Code generation
- Git
- GitHub
- Render
- REST API
- Environment Variables

---

## 🏗️ Project Architecture

```text
                    ┌──────────────────────┐
                    │      User / Admin    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React + Vite UI    │
                    │      Frontend        │
                    └──────────┬───────────┘
                               │
                         REST API
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │       Backend        │
                    └──────────┬───────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
                ▼                             ▼
       ┌─────────────────┐          ┌─────────────────┐
       │     MongoDB     │          │ Authentication  │
       │     Database    │          │      JWT        │
       └─────────────────┘          └─────────────────┘
