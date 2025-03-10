import { MailtrapClient } from "mailtrap";

const TOKEN = "e2142e907d87a87d2e76e294099ed62f";
const SENDER_EMAIL = "hello@demomailtrap.com";
const RECIPIENT_EMAIL = "richverseecotech@gmail.com";

if (!TOKEN) {
  throw new Error("MAILTRAP_TOKEN environment variable is not set");
}

const client = new MailtrapClient({ token: TOKEN });

const sender = { name: "Mailtrap Test", email: SENDER_EMAIL };

client
  .send({
    from: sender,
    to: [{ email: RECIPIENT_EMAIL }],
    subject: "Hello from SANKPOST",
    text: "Welcome and thanks for joining, SANKPOST",
  })
  .then(console.log)
  .catch(console.error);
