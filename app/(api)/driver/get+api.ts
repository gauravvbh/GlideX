import { db } from "@/src/db";
import { drivers, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";




export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const clerkId = url.searchParams.get('clerk_id');
        
        if (!clerkId) {
            return Response.json({ error: "clerk_id is required" }, { status: 400 });
        }
        

        const data = await db.select({
            full_name: users.name,
            email: users.email,
            clerk_id: users.clerk_id,
            number: users.number,
            role: users.role,
            profile_image_url: users.profile_image_url,
            car_image_url: drivers.car_image_url,
            car_seats: drivers.car_seats,
            rating: drivers.rating

        }).from(users)
            .where(eq(users.clerk_id, clerkId))
            .innerJoin(drivers, eq(users.clerk_id, drivers.user_id))

        console.log(data)
        return Response.json(data, { status: 200 })
    } catch (error) {
        console.log(error)
    }

}