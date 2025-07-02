import { db } from "@/src/db";
import { drivers, users as userTable } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/express";

export async function POST(request: Request) {
    try {
        const { name, email, phone, role, clerk_id } = await request.json();

        if (!name || !email || !clerk_id || !role) {
            return new Response(
                JSON.stringify({
                    step: "Validation Failed",
                    error: "Missing Required Fields",
                    received: { name, email, phone, role, clerk_id },
                }),
                { status: 400 }
            );
        }

        // STEP 1: Update Clerk metadata and fetch updated user in one call if possible
        let updatedUser;
        try {
            updatedUser = await clerkClient.users.updateUser(clerk_id, {
                publicMetadata: {
                    role,
                    phone_number: phone,
                },
            });
            // If updateUser does NOT return the updated user object,
            // you might still need clerkClient.users.getUser(clerk_id) here.
            // Check Clerk documentation for exact return value of updateUser.
        } catch (clerkUpdateError: any) {
            return new Response(
                JSON.stringify({
                    step: "Clerk Update Failed",
                    error: clerkUpdateError.message || clerkUpdateError,
                }),
                { status: 500 }
            );
        }

        // STEP 2: Insert or Update user in DB (UPSERT)
        let insertedOrUpdatedUser; // Renamed variable for clarity
        try {
            insertedOrUpdatedUser = await db
                .insert(userTable)
                .values({
                    name,
                    email,
                    number: phone,
                    role,
                    clerk_id,
                    profile_image_url: "",
                })
                .onConflictDoUpdate({
                    target: userTable.email, // Assuming email is unique. If clerk_id is primary, use that.
                    set: {
                        name: name,
                        number: phone,
                        role: role, // Update role if it changes via registration
                        // profile_image_url: "" // Update if needed
                    },
                })
                .returning();

            // Check if the user was actually found/created
            if (!insertedOrUpdatedUser || insertedOrUpdatedUser.length === 0) {
                throw new Error("DB Upsert did not return a user.");
            }

        } catch (dbUserOpError: any) { // Catch both insert and update errors here
            return new Response(
                JSON.stringify({
                    step: "DB User Upsert Failed",
                    error: dbUserOpError.message || dbUserOpError,
                }),
                { status: 500 }
            );
        }

        // STEP 3: If rider, insert into drivers table (still a separate call, but conditional)
        if (role === "rider") {
            try {
                // Before inserting, check if driver record already exists to avoid conflict
                const existingDriver = await db
                    .select()
                    .from(drivers)
                    .where(eq(drivers.user_id, clerk_id));

                if (existingDriver.length === 0) {
                    await db.insert(drivers).values({
                        user_id: clerk_id,
                        car_image_url: "",
                        car_seats: 0,
                        rating: 0,
                    });
                }
                // If existingDriver.length > 0, the driver record already exists,
                // so we don't need to insert again. No need for a "Driver Already Exists" error.
            } catch (insertDriverError: any) {
                return new Response(
                    JSON.stringify({
                        step: "DB Insert Driver Failed",
                        error: insertDriverError.message || insertDriverError,
                    }),
                    { status: 500 }
                );
            }
        }

        // ✅ SUCCESS
        return new Response(
            JSON.stringify({
                step: "User Registered/Updated Successfully", // Adjusted message
                result: insertedOrUpdatedUser[0], // Return the first (and only) row
                clerk_metadata: updatedUser.publicMetadata,
            }),
            { status: 200 }
        );
    } catch (error: any) {
        return new Response(
            JSON.stringify({
                step: "Unhandled Error",
                error: error?.message || error,
                stack: error?.stack || null,
            }),
            { status: 500 }
        );
    }
}