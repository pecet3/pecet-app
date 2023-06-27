import React, { useState, useEffect } from "react";
import Head from "next/head";
import type {
  GetStaticPropsContext,
  NextPage,
  InferGetStaticPropsType,
} from "next";
import { api } from "~/utils/api";
import { prisma } from "~/server/db";
import { RouterOutputs } from "../utils/api";
import { toast } from "react-hot-toast";
import { LoadingFullPage } from "~/components/loading";
import { useRouter } from "next/router";
type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data, isLoading } = api.profile.getUserByName.useQuery({
    username: "pecet3",
  });
  const router = useRouter();

  const name = router.query.slug;

  if (isLoading) return <LoadingFullPage />;

  if (!data) return <p>404</p>;
  console.log(name);
  return (
    <>
      <Head>
        <title>pecetApp</title>
        <meta name="description" content={`pecet app`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="background flex h-screen items-center justify-center">
        <div className="flex flex-col rounded-md bg-zinc-600 p-4 shadow-lg ring-1 ring-indigo-600">
          <div className="flex items-center justify-between gap-4">
            <Image
              src={data.profilePicture}
              className="h-16 w-16 rounded-full shadow-md shadow-slate-700"
              alt="Your profile photo"
              width={48}
              height={48}
            />
            <p>{data.username}</p>
          </div>
        </div>
      </main>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import Image from "next/image";
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

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export default ProfilePage;
