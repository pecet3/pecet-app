import { filterUserForClient } from './../../helpers/filterUserForClient';
import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { clerkClient, type User } from "@clerk/nextjs/server"

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

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

        return filterUserForClient(user)
    }),

    // getUserById: publicProcedure.input(z.object({userId: z.string()})).query()
});