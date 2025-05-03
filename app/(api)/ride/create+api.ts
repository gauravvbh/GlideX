
import { db } from '@/src/db';
import { rides } from '@/src/db/schema';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            origin_address,
            destination_address,
            origin_latitude,
            origin_longitude,
            destination_latitude,
            destination_longitude,
            fare_price,
            payment_status,
            driver_id,
            user_id
        } = body;


        if (
            !origin_address ||
            !destination_address ||
            !origin_latitude ||
            !origin_longitude ||
            !destination_latitude ||
            !destination_longitude ||
            !payment_status ||
            !fare_price ||
            !driver_id ||
            !user_id
        ) {
            return Response.json(
                { error: "Missing required fields" },
                { status: 400 },
            );
        }

        await db.insert(rides)
            .values({
                origin_address,
                destination_address,
                origin_latitude,
                origin_longitude,
                destination_latitude,
                destination_longitude,
                payment_status,
                fare_price,
                driver_id,
                user_id,
            })


        return Response.json(
            { status: 200 }
        );
    } catch (error: any) {
        console.log(error)
        return Response.json({ error: error.message }, { status: 400 });
    }
}