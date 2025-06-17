import { db } from "@/src/db";
import { and, eq, ne } from "drizzle-orm";
import dotenv from "dotenv";
import { drivers, users } from "@/src/db/schema";

dotenv.config({ path: './.env.local' });

export async function GET() {
    try {
        const allDrivers = await db
            .select({
                car_image_url: drivers.car_image_url,
                car_seats: drivers.car_seats,
                profile_image_url: users.profile_image_url,
                rating: drivers.rating,
                id: drivers.user_id,
                email: users.email,
                full_name: users.name,
                number: users.number
            })
            .from(users)
            .innerJoin(drivers, eq(users.clerk_id, drivers.user_id))
            .where(
                and(
                    eq(users.role, 'rider'),
                    ne(drivers.car_image_url, '')
                )
            );

        return Response.json({ data: allDrivers }, { status: 200 })

    } catch (error: any) {
        console.error("Error getting all drivers data:", error);
        return Response.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
    }
}