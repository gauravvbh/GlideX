import { db } from "@/src/db";
import { drivers, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/express";

export async function POST(request: Request) {
    try {
        const { clerk_id, role, number } = await request.json();

        if (!clerk_id || !role || !number) {
            return Response.json({ error: "Missing Required fields" }, { status: 400 });
        }

        const user = await clerkClient.users.getUser(clerk_id);
        if (!user) {
            return Response.json({ message: 'No user present with the given clerk_id' }, { status: 200 });
        }

        console.log('request received:', number, role, clerk_id);
        await clerkClient.users.updateUser(clerk_id, {
            publicMetadata: {
                role: role,
                phone_number: number
            },
        });

        console.log("UPDATED USER DATA:", user.publicMetadata);


        return Response.json({ data: 'done' }, { status: 200 });

    } catch (clerkUpdateError: any) {
        return new Response(
            JSON.stringify({
                step: "Clerk Update Failed",
                error: clerkUpdateError.message || clerkUpdateError,
            }),
            { status: 500 }
        );
    }
}