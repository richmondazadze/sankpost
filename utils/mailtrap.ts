import { Resend } from "resend";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

let resendClient: Resend | null = null;

export const initResend = async () => {
  if (typeof window === "undefined") {
    resendClient = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY!);
  }
};

export const sendWelcomeEmail = async (toEmail: string, name: string) => {
  if (typeof window !== "undefined") {
    console.error("SendWelcomeEmail should only be called on the server side");
    return;
  }

  if (!resendClient) {
    await initResend();
  }

  const sender = "hello@sankpost.me";

  if (!resendClient) {
    throw new Error("Resend client is not initialized");
  }

  await resendClient.emails.send({
    from: sender,
    to: toEmail,
    subject: "Welcome to SankPost AI!",
    html: `<h1>Welcome to SankPost AI, ${name}!</h1> 
    <p>We're thrilled to have you on board!</p>
    <p>At SankPost AI, we strive to provide you with the best tools to enhance your productivity and creativity. Here are a few things you can do to get started:</p>
    <ul>
      <li><strong>Explore our features:</strong> Discover how our AI can assist you in your daily social media tasks.</li>
      <li><strong>Join our community:</strong> Connect with other users and share your experiences.</li>
      <li><strong>Need help?</strong> Our support team is here to assist you with any questions you may have.</li>
    </ul>
    <p>Thank you for choosing SankPost AI. We look forward to helping you achieve your goals!</p>
    <p>Best regards,<br/>The SankPost AI Team</p> 
    `,
  });
};
