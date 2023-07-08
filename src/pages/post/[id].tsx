import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import type {
  GetStaticPropsContext,
  NextPage,
  InferGetStaticPropsType,
} from "next";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { SignUp, useUser, SignOutButton } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { LoadingSpinner, LoadingFullPage } from "~/components/loading";
import { useRouter } from "next/router";
dayjs.extend(relativeTime);

const PostPage: NextPage = () => {
  const router = useRouter();

  const postId = router.query.id?.toString();

  const { isLoaded: userLoaded, isSignedIn, user } = useUser();

  //start fetching asap
  if (typeof postId === "undefined") return;

  const { data, isError } = api.posts.getPostById.useQuery({
    postId: postId,
  });

  const { mutate: mutateDelete } = api.posts.delete.useMutation({});

  if (!data || typeof data === "undefined") return null;

  const author = data[0]?.author;
  const post = data[0]?.post;
  const comments = post?.comments;
  if (
    !userLoaded ||
    typeof author === "undefined" ||
    typeof post === "undefined"
  )
    return <LoadingFullPage />;

  return (
    <>
      <Head>
        <title>pecetApp</title>
        <meta name="description" content="pecet app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className="flex items-end border-b bg-slate-900 p-1">
          <div className="flex justify-start gap-2 md:p-2">
            <Link href={`/@${author.username}`} className="">
              <Image
                src={author.profilePicture}
                alt={`@${author.username}'s avatar`}
                className="h-10 w-10 rounded-full md:h-12 md:w-12"
                width={48}
                height={48}
              />
            </Link>
            <div className="flex flex-col">
              <div className="flex gap-1 text-sm text-slate-300">
                <Link href={`/@${author.username}`}>
                  <span className="font-bold">{`@${author.username}`}</span>
                </Link>
                <Link href={`/post/${post.id}`}>
                  <span className="font-thin">{`∙ ${dayjs(
                    post.createdAt
                  ).fromNow()}`}</span>
                </Link>
                {user?.id === post.authorId ? (
                  <button
                    className="text-xs text-gray-500"
                    onClick={() => {
                      mutateDelete({ postId: post.id, authorId: author.id });
                    }}
                  >
                    <i className="text-xs font-extralight text-slate-200">{` ∙`}</i>{" "}
                    ❌delete
                  </button>
                ) : null}
              </div>
              <div className="max-w-[15rem] grow sm:max-w-md md:max-w-lg">
                <span className=" break-words text-base md:text-lg">
                  {post.content}
                </span>
                <span className="mx-1 text-xl font-bold text-slate-400">{` ∙ ${
                  post.emoji ?? "😐"
                }`}</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p className="flex justify-center border-b py-1 text-xs font-extralight">
            Comments
          </p>
          {comments?.map((comment) => {
            return (
              <div
                key={comment.id}
                className="flex items-end border-b bg-slate-700 p-1"
              >
                <div className="flex justify-start gap-2 md:p-2">
                  <Link
                    href={`/@${comment?.commentAuthor?.username}`}
                    className=""
                  >
                    <Image
                      src={comment?.commentAuthor?.profilePicture || ""}
                      alt={`@${comment?.commentAuthor?.username}'s avatar`}
                      className="h-10 w-10 rounded-full md:h-12 md:w-12"
                      width={48}
                      height={48}
                    />
                  </Link>
                  <div className="flex flex-col">
                    <div className="flex gap-1 text-sm text-slate-300">
                      <Link href={`/@${comment?.commentAuthor?.username}`}>
                        <span className="font-bold">{`@${comment?.commentAuthor?.username}`}</span>
                      </Link>
                      <span className="font-thin">{`∙ ${dayjs(
                        comment.createdAt
                      ).fromNow()}`}</span>

                      {user?.id === comment?.authorId ? (
                        <button
                          className="text-xs text-gray-500"
                          onClick={() => {
                            mutateDelete({
                              postId: post.id,
                              authorId: author.id,
                            });
                          }}
                        >
                          <i className="text-xs font-extralight text-slate-200">{` ∙`}</i>{" "}
                          ❌delete
                        </button>
                      ) : null}
                    </div>
                    <div className="max-w-[15rem] grow sm:max-w-md md:max-w-lg">
                      <span className=" break-words text-base md:text-lg">
                        {comment.content}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PageLayout>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { prisma } from "../../server/db";
import PageLayout from "~/pages/layout";

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });
  const postId = context.params?.id;

  if (typeof postId !== "string") throw new Error("no id");
  // prefetch

  await helpers.posts.getPostById.prefetch({ postId });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      postId,
    },
  };
}

export function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export default PostPage;
