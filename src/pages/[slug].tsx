import React, { useState, useEffect } from "react";
import Head from "next/head";
import type { GetStaticPropsContext, NextPage } from "next";
import { api } from "~/utils/api";
import { prisma } from "~/server/db";
import { LoadingFullPage, LoadingSpinner } from "~/components/loading";
import { useRouter } from "next/router";
import PageLayout from "~/pages/layout";
import { BsFillArrowLeftCircleFill } from "react-icons/bs";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading, isError } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });
  if (isLoading)
    return (
      <div className="mt-28 flex items-center justify-center">
        <LoadingSpinner size={64} />
      </div>
    );

  if (!data || data.length === 0) {
    return (
      <div className="mt-20 flex justify-center">
        <p>There is nothing to show...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-20 flex justify-center">
        <p>Ups something went wrong...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 border-t">
      {data.map((fullpost) => (
        <PostView
          post={fullpost.post}
          author={fullpost.author}
          key={fullpost.post.id}
        />
      )) ?? null}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const router = useRouter();

  const name = router.query.slug as string;

  const parsedName = name.toString().replace("@", "");

  const { data, isLoading, isError } = api.profile?.getUserByName.useQuery({
    username: parsedName,
  });
  if (isLoading) return <LoadingFullPage />;

  if (isError)
    return (
      <div className="flex justify-center">
        <p>error happend</p>
        <Link href="/">return to index</Link>
      </div>
    );
  // https://images2.alphacoders.com/941/thumb-1920-941898.jpg
  if (!data) return <p>404</p>;
  return (
    <>
      <Head>
        <title>{name && name + "'s profile / pecetApp"}</title>
        <meta name="description" content={`pecet app`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className="relative  flex h-60 flex-col bg-slate-800 p-0 ">
          <img
            src={
              data.backgroundImg ??
              "https://images2.alphacoders.com/941/thumb-1920-941898.jpg"
            }
            className="fill h-full bg-slate-800 ring-slate-800"
            alt="Your profile photo"
          />
          <div className="absolute left-1/4 top-36 m-auto flex flex-col items-center justify-center self-start sm:left-8 md:left-2">
            <Image
              src={data.profilePicture}
              className="h-44 w-44 rounded-full bg-slate-700 ring-2 ring-slate-700"
              alt="Your profile photo"
              width={255}
              height={255}
            />
            <p className="text-xl font-bold md:text-2xl">@{data.username}</p>
          </div>
          <BackArrow />
        </div>
        <div className="m-auto mt-24 flex max-w-md p-2 text-sm sm:mb-12 sm:ml-48 sm:mt-4  md:text-base">
          <blockquote className="justify-self-end p-4 italic text-slate-400">
            {data.description}
          </blockquote>
        </div>
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import Image from "next/image";
import Link from "next/link";
import { PostView } from "../components/postView";
import { BackArrow } from "../components/backArrow";
export async function getStaticProps(
  context: GetStaticPropsContext<{ slug: string }>
) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, userId: null },
    transformer: superjson, // optional - adds superjson serialization
  });
  const slug = context.params?.slug;

  const username = slug?.replace("@", "") as string;

  if (typeof slug !== "string") throw new Error("no slug");
  // prefetch

  await helpers.profile.getUserByName.prefetch({ username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
}

export function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export default ProfilePage;
