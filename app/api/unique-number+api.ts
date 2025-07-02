import { db } from "@/src/db";
import { eq } from "drizzle-orm";
// import { clerkClient } from "@clerk/express";
import dotenv from "dotenv";
import { users } from "@/src/db/schema";

dotenv.config({ path: './.env.local' });

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const number = url.searchParams.get('number');
        if (!number) {
            return Response.json({ error: "phone number is required" }, { status: 400 });
        }

        const userWithNumber = await db
            .select()
            .from(users)
            .where(eq(users.number, number));


        if (!!userWithNumber[0]) {
            return Response.json({ unique: false }, { status: 200 })
        }

        return Response.json({ unique: true }, { status: 200 })

    } catch (error: any) {
        console.error("Error Getting all rides:", error);
        return Response.json({ error: error || "Internal Server Error" }, { status: 500 });
    }
}