import { db } from "@/src/db";
import { drivers, users as userTable } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/express";
import dotenv from "dotenv";

dotenv.config({ path: './.env.local' });

export async function POST(request: Request) {
    try {
        const { name, email, phone, role, clerk_id } = await request.json();

        if (!name || !email || !clerk_id || !role) {
            return Response.json({ error: "Missing Required fields" }, { status: 400 });
        }

        // console.log('request received:', name, email, phone, role, clerk_id);
        await clerkClient.users.updateUser(clerk_id, {
            publicMetadata: {
                role,
                phone_number: phone
            },
        });
        const updatedUser = await clerkClient.users.getUser(clerk_id);
        console.log("UPDATED USER DATA:", updatedUser.publicMetadata);

        const isUserPresent = await db.select().from(userTable).where(eq(userTable.email, email));

        if (isUserPresent.length > 0) {
            return Response.json({ data: isUserPresent[0] }, { status: 200 });
        }

        const result = await db.insert(userTable)
            .values({ name, email, number: phone, role, clerk_id, profile_image_url: '' })
            .returning();



        if (role === 'rider') {
            await db.insert(drivers)
                .values({
                    user_id: clerk_id,
                    car_image_url: '',
                    car_seats: 0,
                    rating: 0
                })
        }


        return Response.json({ result }, { status: 200 });

    } catch (error: any) {
        console.error("Error creating user:", error);
        return Response.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
    }
}