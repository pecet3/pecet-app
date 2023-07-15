import { z } from "zod";

import { TRPCError } from "@trpc/server";

import { clerkClient, type User } from "@clerk/nextjs/server"

import { createTRPCRouter, publicProcedure, privateProcedure } from "~/server/api/trpc";

import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import type { Post, Comment } from "@prisma/client"
import { filterUserForClient } from '../../helpers/filterUserForClient';

type PostWithComments = Post & {
    comments: Comment[],
}

const redis = Redis.fromEnv()

const ratelimit = {
    post: new Ratelimit({
        redis,
        analytics: true,
        prefix: "ratelimit:post",
        limiter: Ratelimit.slidingWindow(1, "10m"),
    }),
    comment: new Ratelimit({
        redis,
        analytics: true,
        prefix: "ratelimit:comment",
        limiter: Ratelimit.slidingWindow(1, "10s"),
    })
}

const addUserDataToComments = async (comments: Comment[]) => {
    const userId = comments.map(comment => comment.authorId)

    const users = (await clerkClient.users.getUserList({
        userId,
        limit: 100,
    })).map(filterUserForClient)

    return comments.map((comment) => {
        const commentAuthor = users.find((user) => user!.id === comment.authorId);

        if (!commentAuthor) {
            console.error("AUTHOR NOT FOUND", comment);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Author for post not found. COMMENT ID: ${comment.id}, USER ID: ${comment.authorId}`,
            });
        }

        return {
            ...comment,
            commentAuthor
        }
    })
}

const addUserDataToPosts = async (posts: PostWithComments[]) => {
    const userId = posts.map(post => post.authorId)


    const users = (await clerkClient.users.getUserList({
        userId,
        limit: 100,
    })).map(filterUserForClient)

    return posts.map((post) => {
        const author = users.find((user) => user!.id === post.authorId);

        if (!author) {
            console.error("AUTHOR NOT FOUND", post);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: `Author for post not found. POST ID: ${post.id}, USER ID: ${post.authorId}`,
            });
        }


        return {
            post: {
                ...post,
                comments: post.comments.length
            },
            author: {
                ...author,
                username: author.username
            }
        }
    });
}


export const postsRouter = createTRPCRouter({
    getAll: publicProcedure.query(async ({ ctx }) => {
        const posts = await ctx.prisma.post.findMany({
            orderBy: [{ createdAt: "desc" }],
            take: 100,
            include: {
                comments: true
            },
        }).then(addUserDataToPosts)

        return posts
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

            const { success } = await ratelimit.post.limit(authorId)

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
    addComment: privateProcedure.input(z.object({
        postId: z.string(),
        content: z.string().min(1).max(280),
    })).mutation(async ({ ctx, input }) => {
        const authorId = ctx.userId;

        const { success } = await ratelimit.comment.limit(authorId)

        if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" })


        const comment = await ctx.prisma.comment.create({
            data: {
                authorId,
                content: input.content,
                postId: input.postId
            }
        })

        return comment
    })

    ,


    delete: privateProcedure.input(z.object({
        postId: z.string(),
        authorId: z.string()
    })).mutation(async ({ ctx, input }) => {
        const authorId = ctx.userId

        if (authorId !== input.authorId) return new TRPCError({ code: "UNAUTHORIZED" })

        const deleteComments = await ctx.prisma.comment.deleteMany({
            where: {
                postId:
                    input.postId
            }
        });

        const deletedPost = await ctx.prisma.post.delete({
            where: {
                id: input.postId
            },
        })

        return [deletedPost, deleteComments]

    })

    ,

    deleteComment: privateProcedure.input(z.object({
        commentId: z.string(),
        authorId: z.string()
    })).mutation(async ({ ctx, input }) => {
        const authorId = ctx.userId

        if (authorId !== input.authorId) return new TRPCError({ code: "UNAUTHORIZED" })

        const deletedComments = await ctx.prisma.comment.delete({
            where: {
                id:
                    input.commentId
            }
        });


        return deletedComments

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
            orderBy: [{ createdAt: "desc" }],
            include: {
                comments: true
            }

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
            include: {
                comments: true
            },
            take: 1
        }).then(addUserDataToPosts)

        return post
    }
    ),

    getCommentsByPostId: publicProcedure.input(z.object({
        postId: z.string(),
    })).query(async ({ ctx, input }) => {
        const comments = await ctx.prisma.comment.findMany({
            where: {
                postId: input.postId
            }
        }).then(addUserDataToComments)

        return comments
    })
    ,
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
                    include: {
                        comments: true
                    },
                    orderBy: [{ createdAt: "desc" }],
                }).then(addUserDataToPosts)

            return posts
        }),

});