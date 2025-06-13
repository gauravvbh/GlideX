// import Stripe from 'stripe';


// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//     apiVersion: '2025-04-30.basil',
//     appInfo: {
//         name: 'GlideX',
//     },
// });

// export async function POST(request: Request) {
//     console.log('sex')
//     try {
//         const body = await request.json();
//         console.log('body from backend')
//         console.log(body)
//         let { name, email, amount } = body;

//         // Ensure amount is a valid number and parse it as a float
//         amount = amount ? Math.abs(parseFloat(amount)) : 40;

//         if (!name || !email || !amount) {
//             return Response.json({ error: 'Please enter valid details' }, { status: 400 });
//         }

//         // Convert the amount to cents and round it to avoid floating-point precision issues
//         const amountInCents = Math.round(amount * 100); // Convert to integer in cents

//         // Ensure the amount is a positive integer
//         if (!Number.isInteger(amountInCents) || amountInCents <= 0) {
//             return Response.json({ error: 'Invalid amount' }, { status: 400 });
//         }

//         let customer;
//         const existing = await stripe.customers.list({ email });
//         if (existing.data.length > 0) {
//             customer = existing.data[0];
//         } else {
//             customer = await stripe.customers.create({ email, name });
//         }

//         // Pass apiVersion explicitly when creating the ephemeral key
//         const ephemeralKey = await stripe.ephemeralKeys.create(
//             { customer: customer.id },
//             { apiVersion: '2025-03-31.basil' }
//         );

//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: amountInCents, // Pass the amount as an integer in cents
//             currency: 'usd',
//             customer: customer.id,
//         });

//         return Response.json({
//             paymentIntent: paymentIntent.client_secret,
//             paymentIntentId: paymentIntent.id,
//             customer: customer.id,
//             ephemeralKey: ephemeralKey.secret,
//         });
//     } catch (error) {
//         console.log('error in payment');
//         console.log(error);
//         if (error instanceof Error) {
//             return Response.json({ error: error.message }, { status: 400 });
//         }
//         return Response.json({ error: 'Something went wrong' }, { status: 400 });
//     }
// }



// app/api/create-payment+api.ts

// export async function POST(request: Request) {
//     try {
//         // 1) Parse and validate input
//         const body = await request.json();
//         const { name, email, amount } = body ?? {};
//         if (typeof name !== 'string' || typeof email !== 'string' || isNaN(Number(amount))) {
//             return new Response(
//                 JSON.stringify({ error: 'Please enter valid name, email, and amount.' }),
//                 { status: 400, headers: { 'Content-Type': 'application/json' } }
//             );
//         }

//         // 2) Read Stripe key
//         const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
//         if (!stripeSecretKey) {
//             console.error('Missing STRIPE_SECRET_KEY in environment');
//             return new Response(
//                 JSON.stringify({ error: 'Server misconfiguration: missing Stripe key.' }),
//                 { status: 500, headers: { 'Content-Type': 'application/json' } }
//             );
//         }

//         // 3) Helper to call Stripe and throw on error
//         async function callStripe(path: string, params: Record<string, string>) {
//             const url = `https://api.stripe.com/v1/${path}`;
//             const headers: Record<string, string> = {
//                 Authorization: `Bearer ${stripeSecretKey}`,
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             };
//             if (path === 'ephemeral_keys') {
//                 headers['Stripe-Version'] = '2023-10-16';
//             }
//             const res = await fetch(url, {
//                 method: 'POST',
//                 headers,
//                 body: new URLSearchParams(params),
//             });
//             const text = await res.text();
//             let json;
//             try {
//                 json = JSON.parse(text);
//             } catch {
//                 throw new Error(`Stripe ${path} returned non-JSON: ${text}`);
//             }
//             if (!res.ok) {
//                 throw new Error(`Stripe ${path} error: ${json.error?.message || JSON.stringify(json)}`);
//             }
//             return json;
//         }

//         // 4) Create a Stripe Customer
//         const customer = await callStripe('customers', { email, name });
//         if (!customer.id) throw new Error('Stripe customer missing id');

//         // 5) Create an Ephemeral Key
//         const ephemeralKey = await callStripe('ephemeral_keys', { customer: customer.id });
//         if (!ephemeralKey.secret) throw new Error('Stripe ephemeral key missing secret');

//         // 6) Create a Payment Intent
//         const cents = Math.round(Number(amount) * 100).toString();
//         const paymentIntent = await callStripe('payment_intents', {
//             amount: cents,
//             currency: 'usd',
//             customer: customer.id,
//         });
//         if (!paymentIntent.client_secret || !paymentIntent.id) {
//             throw new Error('Stripe payment_intent missing client_secret or id');
//         }

//         // 7) All good—return the client_secret and IDs
//         return new Response(
//             JSON.stringify({
//                 paymentIntent: paymentIntent.client_secret,
//                 paymentIntentId: paymentIntent.id,
//                 customer: customer.id,
//                 ephemeralKey: ephemeralKey.secret,
//             }),
//             { status: 200, headers: { 'Content-Type': 'application/json' } }
//         );
//     } catch (err: any) {
//         console.error('Create-payment error:', err);
//         return new Response(
//             JSON.stringify({ error: err.message || 'Unknown server error' }),
//             { status: 500, headers: { 'Content-Type': 'application/json' } }
//         );
//     }
// }
  

//curl -X POST https://glidex.expo.app/api/create-payment \
// -H "Content-Type: application/json" \
// -d '{"name":"Test","email":"test@example.com","amount":5}'




// app/api/create-payment+api.ts
export async function POST(request: Request) {
    return new Response(JSON.stringify({ success: true, now: Date.now() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}
  
// curl - X POST https://glidex.expo.app/api/create-payment \
// -H "Content-Type: application/json" \
// -d '{"foo":"bar"}'


