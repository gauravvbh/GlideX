import { db } from "@/src/db";
import { rides } from "@/src/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const clerkId = url.searchParams.get('clerk_id');

        if (!clerkId) {
            return Response.json({ error: "clerk_id is required" }, { status: 400 });
        }

        // Get today's start and end timestamps
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()); //give utc time standard
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);


        const data = await db.select({
            fare_price: rides.fare_price
        })
            .from(rides)
            .where(
                and(
                    eq(rides.driver_id, clerkId),
                    gte(rides.created_at, startOfDay),
                    lt(rides.created_at, endOfDay)
                )
            );


        const totalEarnings = data.reduce((acc, ride) => acc + (ride.fare_price ?? 0), 0);

        const roundedEarnings = Math.round(totalEarnings * 100) / 100;

        return Response.json({
            totalEarnings: roundedEarnings,
        }, { status: 200 });
    } catch (error) {
        console.error(error);
        return Response.json({ error: error }, { status: 500 });
    }
}
