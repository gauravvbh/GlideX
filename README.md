# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.





<!-- made by me -->




# 🚖 GlideX

A feature-rich, production-ready Ride-Hailing Platform built using React Native (Expo), PostgreSQL (via Drizzle ORM), Neon Serverless, Clerk Authentication, Stripe Payments, Firebase Cloud Storage, and WebSocket-based live tracking.

GlideX allows customers to book rides, track drivers in real-time, make payments securely, and enables drivers to manage their availability and accept ride offers.

## 📋 Table of Contents

- Features
- Tech Stack
- Environment Variables
- Setup & Installation
- Database Schema
- State Management
- UI Screenshots
- API & Integrations
- Scripts
- Contributing
- License

## ✨ Features

✅ User Authentication & Role Management via Clerk  
✅ Real-time Driver Tracking via WebSocket  
✅ Google Maps integration for locations & routing  
✅ Ride Offer System: Drivers receive & respond to customer ride requests  
✅ Secure Payments via Stripe  
✅ Profile and Car Details Management for Drivers  
✅ Push Notifications via Expo Notifications  
✅ Ratings system for drivers  
✅ Fully Responsive, Themeable UI built with TailwindCSS + NativeWind  
✅ Serverless-friendly, scales with Neon & Clerk  

## 🧰 Tech Stack

| Category               | Technology                    |
|-------------------------|-------------------------------|
| **Frontend**           | React Native (Expo SDK 53)   |
| **UI Styling**         | TailwindCSS with NativeWind  |
| **State Management**   | Zustand                       |
| **Authentication**     | Clerk                         |
| **Database**           | PostgreSQL (via Neon)         |
| **ORM / DB Migrations**| Drizzle                       |
| **Maps & Geocoding**   | Google Maps API               |
| **Payments**           | Stripe                        |
| **Storage**            | Firebase                      |
| **Notifications**      | Expo Notifications            |
| **Real-time Updates**  | WebSockets                    |
| **Backend API**        | Serverless                    |

## 🔑 Environment Variables
Define the following in .env.local (already configured for Expo and Drizzle):

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
EXPO_PUBLIC_SERVER_URL=
EXPO_PUBLIC_WEB_SOCKET_SERVER_URL=
DATABASE_URL=
EXPO_PUBLIC_GOOGLE_API_KEY=
EXPO_PUBLIC_STRIPE_API_KEY=
STRIPE_SECRET_KEY=
FIREBASE_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

## 🚀 Setup & Installation

### 1️⃣ Install dependencies

```bash
npm install
```
### 2️⃣ Setup environment

Create a `.env.local` file and fill in all required keys (see See [Environment Variables](#environment-variables) for details. section).

### 3️⃣ Run database migrations

```bash
npx drizzle-kit generate:pg
npx drizzle-kit push:pg
```

### 4️⃣ Start the development server

```bash
npx expo start
```
### 5️⃣ Setup Clerk Webhooks (optional but recommended)

See Clerk docs on enabling webhooks for syncing user data.


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
| **Google Maps**     | Geolocation, Routing           |
| **Firebase**        | Media Storage                  |
| **Expo Notifications** | Push Notifications         |
| **WebSocket**       | Real-time location updates     |

---

## 📜 Scripts

| Command                          | Description              |
|----------------------------------|--------------------------|
| `npx expo start`                | Run development server   |
| `npx drizzle-kit generate:pg`  | Generate migrations      |
| `npx drizzle-kit push:pg`      | Run migrations           |
| `npx expo build:android`       | Build Android app        |
| `npx expo build:ios`           | Build iOS app            |

---

## 🤝 Contributing

- Fork the repo
- Create a new branch
- Make your changes
- Open a Pull Request

---

## 📄 License

MIT License — feel free to use & modify.
