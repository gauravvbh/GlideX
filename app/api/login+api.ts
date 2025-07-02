import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config({ path: './.env.local' });

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return Response.json({ error: "Missing Required fields" }, { status: 400 });
        }


        const isUserPresent = await db.select().from(users).where(eq(users.email, email));

        if (!isUserPresent || isUserPresent.length < 1) {
            return Response.json({ error: 'User not present!' }, { status: 200 });
        }


        return Response.json({ data: isUserPresent[0] }, { status: 200 });

    } catch (error: any) {
        console.error("Error creating user:", error);
        return Response.json({ error: error || "Internal Server Error" }, { status: 500 });
    }
}