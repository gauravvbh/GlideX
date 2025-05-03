import { db } from "@/src/db";
import { eq } from "drizzle-orm";
// import { clerkClient } from "@clerk/express";
import dotenv from "dotenv";
import { drivers, rides, users } from "@/src/db/schema";

dotenv.config({ path: './.env.local' });

export async function GET(request: Request) {
    console.log('haha')
    try {
        const url = new URL(request.url);
        const clerkId = url.searchParams.get('clerk_id');
        if (!clerkId) {
            return Response.json({ error: "clerk_id is required" }, { status: 400 });
        }

        const allRidesWithDrivers = await db
            .select({
                ride_id: rides.id,
                origin_address: rides.origin_address,
                destination_address: rides.destination_address,
                origin_latitude: rides.origin_latitude,
                origin_longitude: rides.origin_longitude,
                destination_latitude: rides.destination_latitude,
                destination_longitude: rides.destination_longitude,
                fare_price: rides.fare_price,
                payment_status: rides.payment_status,
                driver_id: rides.driver_id,
                user_id: rides.user_id,
                created_at: rides.created_at,

                driver: {
                    driver_id: drivers.id,
                    full_name: users.name,
                    profile_image_url: users.profile_image_url,
                    car_image_url: drivers.car_image_url,
                    car_seats: drivers.car_seats,
                    rating: drivers.rating,
                }
            })
            .from(rides)
            .where(eq(rides.user_id, clerkId))
            .innerJoin(drivers, eq(rides.driver_id, drivers.user_id))
            .innerJoin(users, eq(drivers.user_id, users.clerk_id));
        // .toSQL();

        return Response.json({ data: allRidesWithDrivers }, { status: 200 })

    } catch (error: any) {
        console.error("Error Getting all rides:", error);
        return Response.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
    }
}