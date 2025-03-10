export default {
  dialect: "postgresql",
  schema: "./utils/db/schema.ts",
  out: "./drizzle",

  dbCredentials: {
    url: "postgresql://sankpost_owner:1nsQRh2kXqeY@ep-yellow-shadow-a5ovm44r.us-east-2.aws.neon.tech/sankpost?sslmode=require",
    connectionString:
      "postgresql://sankpost_owner:1nsQRh2kXqeY@ep-yellow-shadow-a5ovm44r.us-east-2.aws.neon.tech/sankpost?sslmode=require",
  },
};
