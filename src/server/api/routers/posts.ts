import { z } from "zod";

import { clerkClient, type User } from "@clerk/nextjs/server"

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

const filterUserForClient = (user: User) => {
    return { id: user.id, username: user.username, profilePicture: user.profileImageUrl }
}

export const postsRouter = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
            take: 100,
        });

        const users = (await clerkClient.users.getUserList({
            userId: posts.map((post) => post.authorId),
            limit: 100,
        })).map(filterUserForClient)

        return posts.map((post) => ({
            post,
            author: users.find((user) => user.id === post.authorId)
        }))
    }),
});