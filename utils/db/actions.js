import { db } from "./dbConfig";
import { Users, Subscriptions, GeneratedContent } from "./schema";
import { eq, sql, and, desc } from "drizzle-orm";
import { sendWelcomeEmail } from "../mailtrap";

export async function updateUserPoints(userId, points) {
  try {
    const [updatedUser] = await db
      .update(Users)
      .set({ points: sql`${Users.points} + ${points}` })
      .where(eq(Users.stripeCustomerId, userId))
      .returning()
      .execute();
    return updatedUser;
  } catch (error) {
    console.error("Error updating user points:", error);
    return null;
  }
}

export async function getUserPoints(userId) {
  try {
    const users = await db
      .select({ points: Users.points, id: Users.id, email: Users.email })
      .from(Users)
      .where(eq(Users.stripeCustomerId, userId))
      .execute();
    if (users.length === 0) {
      return 0;
    }
    return users[0].points || 0;
  } catch (error) {
    console.error("Error fetching user points:", error);
    return 0;
  }
}

export async function createOrUpdateSubscription(
  userId,
  stripeSubscriptionId,
  plan,
  status,
  currentPeriodStart,
  currentPeriodEnd
) {
  try {
    const [user] = await db
      .select({ id: Users.id })
      .from(Users)
      .where(eq(Users.stripeCustomerId, userId))
      .limit(1);

    if (!user) {
      console.error(`No user found with stripeCustomerId: ${userId}`);
      return null;
    }

    const existingSubscription = await db
      .select()
      .from(Subscriptions)
      .where(eq(Subscriptions.stripeSubscriptionId, stripeSubscriptionId))
      .limit(1);

    let subscription;
    if (existingSubscription.length > 0) {
      // Update existing subscription
      [subscription] = await db
        .update(Subscriptions)
        .set({
          plan,
          status,
          currentPeriodStart,
          currentPeriodEnd,
        })
        .where(eq(Subscriptions.stripeSubscriptionId, stripeSubscriptionId))
        .returning()
        .execute();
    } else {
      [subscription] = await db
        .insert(Subscriptions)
        .values({
          userId: user.id,
          stripeSubscriptionId,
          plan,
          status,
          currentPeriodStart,
          currentPeriodEnd,
        })
        .returning()
        .execute();
    }

    return subscription;
  } catch (error) {
    console.error("Error creating or updating subscription:", error);
    return null;
  }
}

export async function saveGeneratedContent(
  userId,
  content,
  prompt,
  contentType 
) {
  try {
    const [savedContent] = await db
      .insert(GeneratedContent)
      .values({
        userId: sql`(SELECT id FROM ${Users} WHERE stripe_customer_id = ${userId})`,
        content,
        prompt,
        contentType,
      })
      .returning()
      .execute();
    return savedContent;
  } catch (error) {
    console.error("Error saving generated content:", error);
    return null;
  }
}

export async function getGeneratedContentHistory(
  userId,
  limit = 10
) {
  try {
    const history = await db
      .select({
        id: GeneratedContent.id,
        content: GeneratedContent.content,
        prompt: GeneratedContent.prompt,
        contentType: GeneratedContent.contentType,
        createdAt: GeneratedContent.createdAt,
      })
      .from(GeneratedContent)
      .where(
        eq(
          GeneratedContent.userId,
          sql`(SELECT id FROM ${Users} WHERE stripe_customer_id = ${userId})`
        )
      )
      .orderBy(desc(GeneratedContent.createdAt))
      .limit(limit)
      .execute();
    return history;
  } catch (error) {
    console.error("Error fetching generated content history:", error);
    return [];
  }
}

export async function createOrUpdateUser(
  clerkUserId,
  email,
  name
) {
  try {

    const [existingUser] = await db
      .select()
      .from(Users)
      .where(eq(Users.stripeCustomerId, clerkUserId))
      .limit(1)
      .execute();

    if (existingUser) {
      const [updatedUser] = await db
        .update(Users)
        .set({ name, email })
        .where(eq(Users.stripeCustomerId, clerkUserId))
        .returning()
        .execute();
      return updatedUser;
    }

    const [userWithEmail] = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email))
      .limit(1)
      .execute();

    if (userWithEmail) {
      const [updatedUser] = await db
        .update(Users)
        .set({ name, stripeCustomerId: clerkUserId })
        .where(eq(Users.email, email))
        .returning()
        .execute();
      sendWelcomeEmail(email, name);
      return updatedUser;
    }

    const [newUser] = await db
      .insert(Users)
      .values({ email, name, stripeCustomerId: clerkUserId, points: 50 })
      .returning()
      .execute();
    sendWelcomeEmail(email, name);
    return newUser;
  } catch (error) {
    console.error("Error creating or updating user:", error);
    return null;
  }
}
