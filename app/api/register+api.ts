import { db } from "@/src/db";
import { drivers, users as userTable } from "@/src/db/schema";
import { sql } from "drizzle-orm"; // Note: we are using sql from drizzle for raw queries
export async function POST(request: Request) {
    try {
        const { name, email, phone, role, clerk_id } = await request.json();
        if (!name || !phone || !email || !clerk_id || !role) {
            return new Response(
                JSON.stringify({
                    step: "Validation Failed",
                    error: "Missing Required Fields",
                    received: { name, email, phone, role, clerk_id },
                }),
                { status: 400 }
            );
        }
        try {
            // Insert user with ORM (if this causes too many subrequests, we might have to change it too, but let's see)
            await db.insert(userTable).values({
                name,
                email,
                number: phone,
                role,
                clerk_id,
                profile_image_url: "",
            });
        } catch (dbUserOpError: any) {
            if (dbUserOpError.message.includes('unique constraint') || dbUserOpError.message.includes('duplicate key')) {
                // User already exists, which might be acceptable? But in our flow, it should be a new registration.
                // We return an error response for duplicate user.
                return new Response(
                    JSON.stringify({
                        step: "User already exists",
                        error: dbUserOpError.message || dbUserOpError,
                    }),
                    { status: 400 }
                );
            } else {
                return new Response(
                    JSON.stringify({
                        step: "DB User Insert Failed",
                        error: dbUserOpError.message || dbUserOpError,
                    }),
                    { status: 500 }
                );
            }
        }
        // If the role is rider, insert into drivers table
        if (role === "rider") {
            try {
                // Using raw SQL to avoid ORM generating multiple subrequests
                // await db.execute(sql`
                //     INSERT INTO drivers (user_id, car_image_url, car_seats, rating)
                //     VALUES (${clerk_id}, '', 0, 0)
                //     ON CONFLICT (user_id) DO NOTHING
                // `);
                await db
                    .insert(drivers)
                    .values({
                        user_id: clerk_id,
                        car_image_url: '',
                        car_seats: 0,
                        rating: 0,
                    })
                    .onConflictDoNothing({
                        target: [drivers.user_id],
                    });
            } catch (driverError: any) {
                // If it's a unique constraint, we ignore because it's already there.
                if (driverError.message.includes('unique constraint') || driverError.message.includes('duplicate key')) {
                    // Do nothing, it's okay.
                } else {
                    return new Response(
                        JSON.stringify({
                            step: "DB Driver Insert Failed",
                            error: driverError.message || driverError,
                        }),
                        { status: 500 }
                    );
                }
            }
        }
        return new Response(
            JSON.stringify({
                step: "User Registered Successfully"
            }),
            { status: 200 }
        );
    } catch (error: any) {
        return new Response(
            JSON.stringify({
                step: "Unhandled Error",
                error: error?.message || error,
            }),
            { status: 500 }
        );
    }
}
