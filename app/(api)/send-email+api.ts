import Constants from 'expo-constants';
import { Resend } from 'resend';

// const resend = new Resend(process.env.RESEND_API_KEY);

const RESEND_API_URL = Constants.expoConfig?.extra?.RESEND_API_KEY;

const resend = new Resend(RESEND_API_URL);

export async function POST(req: Request) {
    const { to, subject, html } = await req.json();

    try {
        const response = await resend.emails.send({
            from: 'GlideX <onboarding@resend.dev>',
            to,
            subject,
            html,
        });

        return new Response(JSON.stringify({ success: true, response }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error }), { status: 500 });
    }
}
