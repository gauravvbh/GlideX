import { db } from "@/src/db";
import { drivers, users as userTable } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/express";

export async function POST(request: Request) {
    try {
        const { name, email, phone, role, clerk_id } = await request.json();

        if (!name || !email || !clerk_id || !role) {
            return new Response(JSON.stringify({ error: "Missing Required fields" }), { status: 400})
        }

        await clerkClient.users.updateUser(clerk_id, {
            publicMetadata: {
                role,
                phone_number: phone,
            },
        });

        const updatedUser = await clerkClient.users.getUser(clerk_id);
        console.log('UPDATED USER DATA:', updatedUser.publicMetadata);

        const isUserPresent = await db
            .select()
            .from(userTable)
            .where(eq(userTable.email, email));

        console.log('isUserPresent')
        console.log(isUserPresent.length)
        

        if (isUserPresent.length>0) {
            return new Response(JSON.stringify({ data: isUserPresent[0] }), {status: 200});
        }

        const result = await db
            .insert(userTable)
            .values({
                name,
                email,
                number: phone,
                role,
                clerk_id,
                profile_image_url: "",
            })
            .returning();

        if (role === "rider") {
            await db.insert(drivers).values({
                user_id: clerk_id,
                car_image_url: "",
                car_seats: 0,
                rating: 0,
            });
        }

        return new Response(JSON.stringify({ result }), {status: 200});
    } catch (error: any) {
        console.error("Error creating user:", error);
        return new Response(JSON.stringify({ error: error || "Internal Server Error" }), {status: 500});
    }
}



// export async function POST(req: Request) {
//     return new Response(JSON.stringify({ message: "register working test" }));
// }
  

// $ curl - X POST https://glidex.expo.app/register \
// -H "Content-Type: application/json" \
// -d '{
// "name": "John Doe",
//     "email": "john@example.com",
//         "phone": "1234567890",
//             "clerk_id": "user_abc123",
//                 "role": "customer"
// }'
// { "message": "register working test" }