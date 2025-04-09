import { db } from "@/src/db";
import { users } from "@/src/db/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

export async function POST(request: Request) {
    try {
        const { name, email, clerk_id } = await request.json();
        console.log('Received:', name, email, clerk_id)
        if (!name || !email || !clerk_id) {
            return Response.json(
                { error: "Missing Required fields" },
                { status: 400 },
            )
        }

        const result = await db.insert(users)
            .values({
                name,
                email,
                clerk_id
            })
            .returning();

        console.log('Insert result:', result);

        return Response.json(
            { result },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Error creating user:", error);

        if (error.code === '23505') {
            // Postgres duplicate violation
            return Response.json(
                { error: 'User already exists with this email or clerk_id' },
                { status: 409 }
            );
        }
        return Response.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}