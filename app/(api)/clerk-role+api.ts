import { db } from "@/src/db";
import { drivers, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/express";
import dotenv from "dotenv";

dotenv.config({ path: './.env.local' });

export async function POST(request: Request) {
    try {
        const { clerk_id, role, email } = await request.json();

        if (!clerk_id || !role || !email) {
            return Response.json({ error: "Missing Required fields" }, { status: 400 });
        }


        const isUserPresent = await db.select().from(users).where(eq(users.email, email));

        if (!isUserPresent) {
            return Response.json({ error: 'User not present!' }, { status: 200 });
        }

        // console.log('request received:', name, email, phone, role, clerk_id);
        await clerkClient.users.updateUser(clerk_id, {
            publicMetadata: {
                role: role,
                phone_number: isUserPresent[0].number
            },
        });
        const updatedUser = await clerkClient.users.getUser(clerk_id);
        console.log("UPDATED USER DATA:", updatedUser.publicMetadata);


        return Response.json({ data: 'done' }, { status: 200 });

    } catch (error: any) {
        console.error("Error creating user:", error);
        return Response.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
    }
}