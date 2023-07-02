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

  const { isLoaded: userLoaded, isSignedIn } = useUser();

  //start fetching asap
  if (typeof postId === "undefined") return;

  const { data, isError } = api.posts.getPostById.useQuery({
    postId: postId,
  });

  if (!data || typeof data === "undefined") return null;

  const author = data[0]?.author;
  const post = data[0]?.post;

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
      <main className="background flex h-screen items-center justify-center">
        <div className="flex items-center gap-1 rounded-lg bg-emerald-700 p-2 md:gap-4 md:p-4">
          <Link
            href={`/@${author.username}`}
            className="flex self-start md:self-center "
          >
            <Image
              src={author.profilePicture}
              alt={`@${author.username}'s avatar`}
              className="h-12 w-12 rounded-full bg-slate-500 ring-2 ring-slate-400 md:h-48 md:w-48 md:ring-4"
              height={48}
              width={48}
            />
          </Link>
          <div className="flex flex-col items-start gap-2 md:gap-4">
            <div className="text-md flex gap-1 text-cyan-400 md:text-2xl">
              <span className="font-bold">{`@${author.username}`}</span>
              <span className="font-thin">{`∙ ${dayjs(
                post.createdAt
              ).fromNow()}`}</span>
            </div>
            <span className="text-md max-w-[18rem] break-words md:max-w-xl md:text-4xl">
              {post.content}
            </span>
          </div>
        </div>
      </main>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { prisma } from "../../server/db";

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
