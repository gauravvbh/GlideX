import { Driver } from "@/types/type";
import type { UserResource } from "@clerk/types"; // Clerk's user type

type PlainDriver = Omit<
  Driver,
  | "setCarImageURL"
  | "setCarSeats"
  | "setTime"
  | "setPrice"
  | "setUser"
  | "setUserLocation"
  | "setId"
  | "setProfileImageURL"
  | "setRating"
  | "setFullName"
  | "setRole"
>;

export const getDangerEmailHtml = (driver: PlainDriver, user: UserResource) => `
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Ride Alert</title>
    </head>
    <body
      style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0D0E0D; color: #E0E0E0; margin: 0;"
    >
      <div
        style="max-width: 600px; margin: auto; background-color: #0D0E0D; border-radius: 12px; padding: 25px; color: #E0E0E0;"
      >
        <!-- Header -->
        <div style="text-align: center; padding-bottom: 24px;">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/glidex-83723.firebasestorage.app/o/app_assets%2Ficon.png?alt=media&token=dc64c455-792e-4562-8f5b-b87566240b8c"
            alt="App Logo"
            style="height: 100px; background-color: #0D0E0D; padding: 4px; border-radius: 8px;"
          />
          <h1 style="margin: 16px 0 0; font-size: 24px; color: #7EB6FF;">Ride Alert</h1>
        </div>

        <!-- Alert -->
        <h2
          style="margin-top: 32px; color: #EF5350; font-weight: 600; font-size: 20px;"
        >
          Ride Not Confirmed
        </h2>

        <!-- Message -->
        <p style="font-size: 16px; line-height: 1.6; margin-top: 16px; color: #E0E0E0;">
          The driver completed the ride, but the passenger
          <strong style="color: #E0E0E0;">${user?.firstName ?? "No Name"}</strong>
          (<strong style="color: #E0E0E0;">${user?.primaryEmailAddress?.emailAddress ?? "No Email"}</strong>)
          has not yet confirmed arrival at the intended destination or satisfaction with the drop-off point.
        </p>

        <!-- Section: Driver Info -->
        <div
          style="margin-top: 32px; padding: 24px; border: 1px solid #2A2A2A; border-radius: 8px; background-color: #141514;"
        >
          <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #7EB6FF;">Driver Info</h3>
          <ul style="list-style: none; padding: 0; margin: 0; color: #E0E0E0;">
            <li style="margin-bottom: 6px;"><strong style="color: #E0E0E0;">Name:</strong> ${driver.full_name}</li>
            <li style="margin-bottom: 6px;"><strong style="color: #E0E0E0;">Phone:</strong> ${driver.number}</li>
            <li style="margin-bottom: 6px;"><strong style="color: #E0E0E0;">Email:</strong> ${driver.email}</li>
            <li><strong style="color: #E0E0E0;">Rating:</strong> ${driver.rating}</li>
          </ul>
          <img
            src="${driver.profile_image_url}"
            alt="Driver Image"
            width="60"
            height="60"
            style="border-radius: 50%; margin-top: 12px;"
          />
        </div>

        <!-- Section: Car Info -->
        <div
          style="margin-top: 24px; padding: 24px; border: 1px solid #2A2A2A; border-radius: 8px; background-color: #141514;"
        >
          <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #7EB6FF;">Car Info</h3>
          <ul style="list-style: none; padding: 0; margin: 0; color: #E0E0E0;">
            <li><strong style="color: #E0E0E0;">Seats:</strong> ${driver.car_seats}</li>
          </ul>
          <img
            src="${driver.car_image_url}"
            alt="Car Image"
            width="100"
            style="margin-top: 12px; border-radius: 6px;"
          />
        </div>

        <!-- Section: Last Known Location -->
        <div
          style="margin-top: 24px; padding: 24px; border: 1px solid #2A2A2A; border-radius: 8px; background-color: #141514;"
        >
          <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #7EB6FF;">Last Known Location</h3>
          <ul style="list-style: none; padding: 0; margin: 0; color: #E0E0E0;">
            <li style="margin-bottom: 6px;"><strong style="color: #E0E0E0;">Address:</strong> ${driver.userAddress}</li>
            <li style="margin-bottom: 6px;"><strong style="color: #E0E0E0;">Latitude:</strong> ${driver.userLatitude}</li>
            <li><strong style="color: #E0E0E0;">Longitude:</strong> ${driver.userLongitude}</li>
          </ul>
        </div>

        <!-- Footer -->
        <div
          style="margin-top: 40px; text-align: center; font-size: 13px; color: #888;"
        >
          <p style="color: #888;">This alert was auto-generated for safety monitoring purposes.</p>
          <p style="color: #888;">&copy; ${new Date().getFullYear()} GlideX. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
`;
