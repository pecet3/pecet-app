import React, { useState, useEffect } from "react";
import Head from "next/head";

import { api } from "~/utils/api";
import { prisma } from "~/server/db";
import { RouterOutputs } from "../utils/api";
import { toast } from "react-hot-toast";
import { LoadingFullPage } from "~/components/loading";

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;
export default function ProfilePage() {
  const { data, isLoading } = api.profile.getUserByName.useQuery({
    username: "pecet3",
  });

  if (isLoading) return <LoadingFullPage />;

  if (!data) return <p>404</p>;
  console.log(data);
  return (
    <>
      <Head>
        <title>pecetApp</title>
        <meta name="description" content="pecet app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="background flex h-screen items-center justify-center">
        <p>{data.username}</p>
      </main>
    </>
  );
}
import { createServerSideHelpers } from "@trpc/react-query/server";
import {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from "next";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
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
