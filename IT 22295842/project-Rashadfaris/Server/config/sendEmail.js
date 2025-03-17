import { Resend } from 'resend';
import dotenv from 'dotenv';


dotenv.config();

if (!process.env.RESEND_API) {
    console.error(" ERROR: RESEND_API key is missing in .env file!");
}

const resend = new Resend(process.env.RESEND_API);

export default async function sendEmail({ sendTo, subject, html }) {
    try {
        console.log(" Sending Email to:", sendTo);
        console.log(" Email Subject:", subject);
        console.log(" Email HTML:", html);

        const { data, error } = await resend.emails.send({
            from: 'IT22295842 <onboarding@resend.dev>',
            to: sendTo,
            subject: subject,
            html: html,
        });

        if (error) {
            console.error("Email Sending Error:", error);
            return false;
        }

        console.log("Email Sent Successfully:", data);
        return true;
    } catch (error) {
        console.error("Email Sending Failed:", error);
        return false;
    }
}
