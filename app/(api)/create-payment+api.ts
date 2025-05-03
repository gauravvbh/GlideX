import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-03-31.basil',
    appInfo: {
        name: 'GlideX',
    },
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        let { name, email, amount } = body;

        // Ensure amount is a valid number and parse it as a float
        amount = amount ? Math.abs(parseFloat(amount)) : 40;

        if (!name || !email || !amount) {
            return Response.json({ error: 'Please enter valid details' }, { status: 400 });
        }

        // Convert the amount to cents and round it to avoid floating-point precision issues
        const amountInCents = Math.round(amount * 100); // Convert to integer in cents

        // Ensure the amount is a positive integer
        if (!Number.isInteger(amountInCents) || amountInCents <= 0) {
            return Response.json({ error: 'Invalid amount' }, { status: 400 });
        }

        let customer;
        const existing = await stripe.customers.list({ email });
        if (existing.data.length > 0) {
            customer = existing.data[0];
        } else {
            customer = await stripe.customers.create({ email, name });
        }

        // Pass apiVersion explicitly when creating the ephemeral key
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customer.id },
            { apiVersion: '2025-03-31.basil' }
        );

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents, // Pass the amount as an integer in cents
            currency: 'usd',
            customer: customer.id,
        });

        return Response.json({
            paymentIntent: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            customer: customer.id,
            ephemeralKey: ephemeralKey.secret,
        });
    } catch (error) {
        console.log('error in payment');
        console.log(error);
        if (error instanceof Error) {
            return Response.json({ error: error.message }, { status: 400 });
        }
        return Response.json({ error: 'Something went wrong' }, { status: 400 });
    }
}
