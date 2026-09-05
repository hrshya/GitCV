import express from "express";
import { verifyWebhook } from "@clerk/express/webhooks";
import { prisma } from "../db.js";
import { configDotenv } from "dotenv";
import { clerkMiddleware, getAuth } from "@clerk/express";

configDotenv();

export const userRouter = express.Router();

userRouter.post("/webhooks/clerk", express.raw({ type: "application/json" }), async (req, res) => {
    try {
      const signingSecret = process.env.CLERK_WEBHOOK_SECRET;
      if (!signingSecret) {
        throw new Error("CLERK_WEBHOOK_SECRET is not configured");
      }

      const event = await verifyWebhook(req, { signingSecret });

      if (event.type === "user.created") {
        const user = event.data;

        const clerkUserId = user.id;

        const email =
          user.email_addresses?.[0]?.email_address ?? null;

        const name =
          user.first_name || user.last_name
            ? [user.first_name, user.last_name]
                .filter(Boolean)
                .join(" ")
            : user.username ?? null;

        await prisma.user.upsert({
          where: {
            clerkUserId,
          },
          update: {
            email: email,
            name: name,
          },
          create: {
            clerkUserId,
            email,
            name,
          },
        });
      }

      return res.status(200).json({
        received: true,
      });
    } catch (err) {
      console.error("Clerk webhook error:", err);

      return res.status(400).json({
        received: false,
      });
    }
  }
);

userRouter.get("/", clerkMiddleware(), async (req, res) => {
    const { userId } = getAuth(req);
    try {
        const user = await prisma.user.findFirst({
            where: {
              clerkUserId: userId,
            },
        });
        console.log("Fetched user:", user?.personalDetails);
        return res.status(200).json({ resumeJson: user?.personalDetails || {} });
    } catch (err) {
        console.error("Error fetching user:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
