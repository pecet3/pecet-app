import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { clerkClient, type User } from "@clerk/nextjs/server"

import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 3 requests per 60 seconds
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(3, "1 m"),
    analytics: true,
});

const filterUserForClient = (user: User) => {
    return { id: user.id, username: user.username, profilePicture: user.profileImageUrl }
}

export const profileRouter = createTRPCRouter({

    getUserByName: publicProcedure.input(z.object({ username: z.string() })).query(async ({ input }) => {
        const [user] = await clerkClient.users.getUserList({
            username: [input.username]
        })

        if (!user) {
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "User not found",
            })
        }

        return user
    })
});