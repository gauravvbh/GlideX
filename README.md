# 🚖 GlideX

<p align="center">
  <img src="https://firebasestorage.googleapis.com/v0/b/glidex-83723.appspot.com/o/app_assets%2Ficon.png?alt=media&token=dc64c455-792e-4562-8f5b-b87566240b8c" alt="GlideX Logo" width="150" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-green" />
  <img src="https://img.shields.io/badge/platform-Android%20%7C%20iOS-blue" />
  <img src="https://img.shields.io/badge/Expo-SDK%2053-000" />
  <img src="https://img.shields.io/badge/EAS-Build-blueviolet" />
  <img src="https://img.shields.io/badge/ORM-Drizzle-yellow" />
  <img src="https://img.shields.io/badge/Auth-Clerk-orange" />
</p>

<p align="center">
  A feature-rich, production-ready Ride-Hailing Platform built using React Native (Expo), PostgreSQL (via Drizzle ORM), Neon Serverless, Clerk Authentication, Stripe Payments, Firebase Cloud Storage, WebSocket-based live tracking, and a dedicated Node.js utility backend.
</p>

<p align="center">
  GlideX allows customers to book rides, track drivers in real-time, make payments securely, and enables drivers to manage their availability and accept ride offers.
</p>


---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🧰 Tech Stack](#-tech-stack)
- [🔑 Environment Variables](#-environment-variables)
- [🚀 Setup & Installation](#-setup--installation)
- [🗃️ Database Schema](#️-database-schema)
- [🗂️ State Management](#️-state-management)
- [🔧 Utility Backend Server](#️-utility-backend-server)
- [🎨 UI Screenshots](#-ui-screenshots)
- [🌐 API & Integrations](#-api--integrations)
- [🧪 Testing](#-testing)
- [📈 Performance & Scalability](#-performance--scalability)
- [🛠️ Deployment](#️-deployment)
- [📜 Scripts](#-scripts)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

- Clerk-based User Authentication & Role Management  
- Real-time Driver-Customer Tracking via WebSocket  
- Google Maps Integration for Geolocation & Routing
- Ride Offer System: Drivers receive & respond to customer ride requests via WebSocket
- Secure Mobile Payments via Stripe
- Email Notifications for Transactions & Updates via Nodemailer  
- Driver Profile & Car Details Management 
- Push Notifications via Expo Notifications  
- Ratings system for drivers  
- Fully Responsive, Themeable UI built with TailwindCSS + NativeWind  
- Serverless-friendly, scales with Neon & Clerk
- Animations with LottieFiles  

---

## 🧰 Tech Stack

| Category               | Technology                    |
|------------------------|-------------------------------|
| **Frontend**           | React Native (Expo SDK 53)    |
| **UI Styling**         | TailwindCSS with NativeWind   |
| **State Management**   | Zustand                       |
| **Authentication**     | Clerk                         |
| **Database**           | PostgreSQL (via Neon)         |
| **ORM / DB Migrations**| Drizzle                       |
| **Maps & Geocoding**   | Google Maps API               |
| **Payments**           | Stripe                        |
| **Storage**            | Firebase                      |
| **Notifications**      | Expo Notifications            |
| **Real-time Updates**  | WebSockets                    |
| **Utility Backend**    | Node.js (Express, Nodemailer) |
| **Animations**         | LottieFiles                   |

---

## 🔑 Environment Variables
**App**

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
EXPO_PUBLIC_SERVER_URL
EXPO_PUBLIC_WEB_SOCKET_SERVER_URL=
DATABASE_URL
EXPO_PUBLIC_GOOGLE_API_KEY
EXPO_PUBLIC_STRIPE_API_KEY
STRIPE_SECRET_KEY
FIREBASE_API_KEY
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
```
**Utility Backend Server**

```env
PORT
STRIPE_SECRET_KEY
GMAIL_USER
GMAIL_PASS
```

## 🚀 Setup & Installation

###  Install dependencies

```bash
npm install
```
###  Setup environment

Create .env.local and .env files with the keys mentioned in [Environment Variables](#environment-variables).

###  Run database migrations

```bash
npx drizzle-kit generate:pg
npx drizzle-kit push:pg
```

###  Start the development server

```bash
npx expo start
```
###  Optional: Setup Clerk Webhooks

For syncing user data and events. See [Clerk Webhooks](https://clerk.com/docs/webhooks/overview).


## 🗃️ Database Schema

**Tables:**

- **users**  
  `id`, `name`, `email`, `clerk_id`, `number`, `role`, `profile_image_url`

- **drivers**  
  `id`, `user_id (FK)`, `car_image_url`, `car_seats`, `rating`

- **rides**  
  `id`, `origin_address`, `destination_address`, `origin_latitude`, `origin_longitude`, `destination_latitude`, `destination_longitude`, `fare_price`, `payment_status`, `driver_id (FK)`, `user_id (FK)`, `created_at`

See `src/db/schema.ts` for exact schema.

---

## 🗂️ State Management

Uses Zustand with custom stores:

- `useDriverStore`
- `useRideOfferStore`
- `useCustomer`
- `useDriver`
- `useRidesStore`
- `useDriverDetails`
- `useUserStore`
- `useWSStore`

All stores are defined under `src/store`.

---

## 🔧 Utility Backend Server

GlideX includes a lightweight **Express-based server** for handling tasks that require sensitive server-side credentials and cannot be run on the client.

### 📦 Features 

- Stripe Payment Intent Creation  
- Ephemeral Keys for Stripe Mobile SDK  
- Email Sending via Nodemailer + Gmail SMTP  
- CORS & JSON support  

### 🚀 Run the server

```bash
cd utils-server
npm install
npm start
```

Accessible at:  [http://localhost:3000](http://localhost:3000).

---

## 🎨 UI Screenshots

Here are some screens showcasing the GlideX user experience for both customers and drivers.

### 📱 Customer Home
![Customer Home](https://your-screenshot-link-here.com/customer-home.png)

### 🚘 Driver Dashboard
![Driver Dashboard](https://your-screenshot-link-here.com/driver-dashboard.png)

### 📍 Live Ride Tracking
![Live Ride Tracking](https://your-screenshot-link-here.com/live-ride-tracking.png)

*(Replace the above links with actual hosted screenshots of your app.)*


---

## 🌐 API & Integrations

| Integration         | Purpose                         |
|----------------------|---------------------------------|
| **Clerk**           | Authentication, User Management |
| **Neon**            | Serverless PostgreSQL          |
| **Drizzle**         | Database ORM and migrations    |
| **Stripe**          | Payment processing             |
| **Google Maps**     | Geolocation, Routing, AutoComplete|
| **Firebase**        | Media Storage                  |
| **Expo Notifications** | Push Notifications         |
| **WebSocket**       | Real-time location updates     |
| **Nodemailer**       | Email notifications    |

---

## 🧪 Testing

- Unit tests for business logic (**Coming Soon**)  

- End-to-end flow tested on Android & iOS Simulators 

- Manual QA for real-time updates, payments, and notifications

- Tested on Expo Go and EAS production builds
- Basic load testing and error handling verified

---

## 📈 Performance & Scalability

- Stateless, serverless-friendly architecture

- Real-time updates using WebSockets

- Optimistic UI updates for better UX

- Secure OAuth & HTTPS-ready

- Horizontally scalable backend
---

## 🛠️ Deployment

Built & deployed via **Expo Application Services (EAS)**.

### 📦 Build

Build for Android or iOS using your preferred EAS build profile (`production`, `development`, etc.):

```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

For the web export:

```bash
npx expo export --platform web
eas deploy --prod
```

See [EAS Build Docs](https://docs.expo.dev/build/introduction/) and [EAS Submit Docs](https://docs.expo.dev/submit/introduction/).

---

## 📜 Scripts

| Command                          | Description              |
|----------------------------------|--------------------------|
| `npx expo start`                | Start development server   |
| `npx drizzle-kit generate:pg`  | Generate migrations      |
| `npx drizzle-kit push:pg`      | Run migrations           |
| `npm start`                     | Start utility backend    |
| `eas build`           | Build production app            |

---

## 🤝 Contributing
Contributions are welcome!

- Fork the repository
- Create a feature branch
- Commit your changes
- Open a Pull Request

---

## 📄 License

MIT License — feel free to use, modify, and distribute.
