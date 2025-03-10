import { sendEmail } from "./sendEmail.mjs";

const testEmail = async () => {
  try {
    const response = await sendEmail(
      "richverseecotech@gmail.com", // Replace with the actual recipient email
      "Test Subject",
      "<p>This is a test email!</p>"
    );
    console.log("Test email sent successfully:", response);
  } catch (error) {
    console.error("Failed to send test email:", error);
  }
};

testEmail();
