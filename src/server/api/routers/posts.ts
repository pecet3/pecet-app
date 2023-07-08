import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { clerkClient, type User } from "@clerk/nextjs/server"

import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import type { Post } from "@prisma/client"

const addUserDataToPosts = async (posts: Post[]) => {
    const userId = posts.map(post => post.authorId)

    const users = (await clerkClient.users.getUserList({
        userId,
        limit: 100,
    })).map(filterUserForClient)

    return posts.map((post) => {
        const author = users.find((user) => user.id === post.authorId);

        if (!author) {
            console.error("AUTHOR NOT FOUND", post);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Author for post not found. POST ID: ${post.id}, USER ID: ${post.authorId}`,
            });
        }
        // if (!author.username) {
        //   // user the ExternalUsername
        //   if (!author.externalUsername) {
        //     throw new TRPCError({
        //       code: "INTERNAL_SERVER_ERROR",
        //       message: `Author has no GitHub Account: ${author.id}`,
        //     });
        //   }
        //   author.username = author.externalUsername;
        // }
        return {
            post,
            author: {
                ...author,
                username: author.username ?? "(username not found)",
            },
        };
    });
}

// Create a new ratelimiter, that allows 1 requests per 60 minutes
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, "60 m"),
    analytics: true,
});

const filterUserForClient = (user: User) => {
    return { id: user.id, username: user.username, profilePicture: user.profileImageUrl }
}

export const postsRouter = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
            orderBy: [{ createdAt: "desc" }],
            take: 100,
            include: {
                comments: true
            }
        });

        const users = (await clerkClient.users.getUserList({
            userId: posts.map((post) => post.authorId),
            limit: 100,
        })).map(filterUserForClient)

        return posts.map((post) => {
            const author = users.find((user) => user.id === post.authorId)

            const commentAuthor = users.find((user) => user.id === post.comments[0]?.authorId)

            if (!author || !author.username) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Author not found" })
            return {
                post: {
                    ...post,
                    comments: {
                        ...post.comments,
                        commentAuthor
                    },
                },
                author: {
                    ...author,
                    username: author.username
                }
            }
        })
    }),
    create: privateProcedure
        .input(
            z.object({
                content: z.string().min(1).max(280),
                emoji: z.string().emoji().min(1).max(2)
            })
        )
        .mutation(async ({ ctx, input }) => {
            const authorId = ctx.userId;

            const { success } = await ratelimit.limit(authorId)

            if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" })

            const post = await ctx.prisma.post.create({
                data: {
                    authorId,
                    emoji: input.emoji,
                    content: input.content,
                }
            })
            return post
        }),
    delete: privateProcedure.input(z.object({
        postId: z.string(),
        authorId: z.string()
    })).mutation(async ({ ctx, input }) => {
        const authorId = ctx.userId

        if (authorId !== input.authorId) return new TRPCError({ code: "UNAUTHORIZED" })

        const deletedUser = await ctx.prisma.post.delete({
            where: {
                id: input.postId
            }
        })

        return deletedUser

    })

    ,

    getPostsById: publicProcedure.input(z.object({
        userId: z.string(),
    })).query(async ({ ctx, input }) => {
        const posts = await ctx.prisma.post.findMany({
            where: {
                authorId: input.userId
            },
            take: 100,
            orderBy: [{ createdAt: "desc" }]

        }).then(addUserDataToPosts)
        return posts
    }),
    getPostById: publicProcedure.input(z.object({
        postId: z.string(),
    })).query(async ({ ctx, input }) => {
        const post = await ctx.prisma.post.findMany({
            where: {
                id: input.postId
            },
            take: 1
        }).then(addUserDataToPosts)

        return post
    }
    ),

    getPostsByUserId: publicProcedure
        .input(
            z.object({
                userId: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const posts = await ctx.prisma.post
                .findMany({
                    where: {
                        authorId: input.userId,
                    },
                    take: 100,
                    orderBy: [{ createdAt: "desc" }],
                }).then(addUserDataToPosts)

            return posts
        }),
});