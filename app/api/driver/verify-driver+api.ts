import { db } from "@/src/db";
import { drivers, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";




export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { carImageUri, profileImage, rating, carSeats, id } = body;

        if (!carImageUri || !profileImage || !rating || !carSeats) {
            return Response.json({ error: "All fields are required" }, { status: 400 });
        }


        await db.update(drivers).set({
            car_seats: carSeats,
            car_image_url: carImageUri,
            rating
        }).where(eq(drivers.user_id, id))

        await db.update(users).set({
            profile_image_url: profileImage
        }).where(eq(users.clerk_id, id))

        return Response.json({ message: 'Driver verified' }, { status: 200 })


    } catch (error) {
        console.error("POST /driver/verify-driver failed", error)
        return Response.json(error, { status: 500 });
    }
}