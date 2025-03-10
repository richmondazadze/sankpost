import { NextResponse } from "next/server";
import { sendWelcomeEmail } from "../../../utils/mailtrap"; // Import the sendWelcomeEmail function

export async function POST(request: Request) {
  const { name, email, message } = await request.json();

  try {
    // Ensure that sendWelcomeEmail is called in a server-side context
    await sendWelcomeEmail(email, name); // This is safe as this code runs on the server

    // Optionally, you can log the message or send it as well
    console.log(`Message from ${name}: ${message}`);

    return NextResponse.json(
      { message: "Email sent successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
