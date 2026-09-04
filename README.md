# MyCarsHub

MyCarsHub is a full-stack peer-to-peer used-car marketplace that allows users to buy and sell used cars, communicate with sellers, save and compare listings, and manage their listings through a dedicated dashboard.

## Features

### Marketplace
- Browse used-car listings
- Search and filter cars
- View detailed car information
- Upload multiple car images
- Save cars for later
- Compare cars side-by-side

### Authentication & Users
- User registration and login
- JWT-based authentication using HttpOnly cookies
- Protected routes
- Buyer and seller workflows

### Seller Features
- Create, edit and delete car listings
- Image uploads through Cloudinary
- Seller dashboard
- Listing management
- Seller verification
- Pro subscription with increased listing limits

### Buyer-Seller Communication
- Real-time buyer-seller chat
- Conversation management
- Socket.IO powered messaging

### Admin Features
- Admin dashboard
- Marketplace statistics
- Seller verification review
- Listing reports management
- Payment records and revenue overview

### Payments
- Razorpay integration
- Seller verification payments
- Pro subscription payments
- Payment verification using Razorpay signatures
- Subscription status management

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

### Authentication
- JWT
- HttpOnly cookies

### Services & Integrations
- Cloudinary — image storage
- Socket.IO — real-time chat
- Razorpay — payments and subscriptions

## Architecture

```text
React + Vite
     │
     │ REST API / Axios
     ▼
Node.js + Express
     │
     ├── JWT Authentication
     ├── Car Listings
     ├── Saved / Compare Cars
     ├── Chat API
     ├── Admin Operations
     └── Razorpay Payments
     │
     ├──────────────► MongoDB
     │
     ├──────────────► Cloudinary
     │
     ├──────────────► Razorpay
     │
     └──────────────► Socket.IO