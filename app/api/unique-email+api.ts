import { db } from "@/src/db";
import { eq } from "drizzle-orm";
// import { clerkClient } from "@clerk/express";
import dotenv from "dotenv";
import { users } from "@/src/db/schema";

dotenv.config({ path: './.env.local' });

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const email = url.searchParams.get('email');
        if (!email) {
            return Response.json({ error: "email address is required" }, { status: 400 });
        }

        const userWithEmail = await db
            .select()
            .from(users)
            .where(eq(users.email, email));


        if (!!userWithEmail[0]) {
            return Response.json({ isUnique: false }, { status: 200 })
        }

        return Response.json({ isUnique: true }, { status: 200 })

    } catch (error: any) {
        console.error("Error Getting all rides:", error);
        return Response.json({ error: error || "Internal Server Error" }, { status: 500 });
    }
}