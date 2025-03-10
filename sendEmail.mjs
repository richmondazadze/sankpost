import { Resend } from "resend";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Check for the API key
const apiKey = process.env.NEXT_PUBLIC_RESEND_API_KEY;
if (!apiKey) {
  throw new Error(
    "Missing API key. Please set the NEXT_PUBLIC_RESEND_API_KEY environment variable."
  );
}

const resend = new Resend(apiKey);

export const sendEmail = async (to, subject, html) => {
  try {
    const response = await resend.emails.send({
      from: "hello@sankpost.me", // Update with your sender email
      to: [to], // Use the 'to' parameter
      subject,
      html,
    });
    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
