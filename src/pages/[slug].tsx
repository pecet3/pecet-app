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
import { PageLayout } from "~/pages/layout";
type PageProps = InferGetStaticPropsType<typeof getStaticProps>;

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const router = useRouter();

  const name = router.query.slug as string;

  const parsedName = name.replace("@", "");

  const { data, isLoading, isError } = api.profile?.getUserByName.useQuery({
    username: parsedName,
  });
  if (isLoading) return <LoadingFullPage />;

  if (isError)
    return (
      <div>
        <p>error happend</p>
        <Link href="/">return to index</Link>
      </div>
    );

  if (!data) return <p>404</p>;
  console.log(parsedName);
  return (
    <>
      <Head>
        <title>{name || ""}`s profile / pecetApp</title>
        <meta name="description" content={`pecet app`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className="relative flex h-2/6 flex-col  bg-zinc-600 p-4 ">
          <div className="absolute top-36 flex flex-col items-center self-start">
            <Image
              src={data.profilePicture}
              className="shadow-mdring-2 h-44 w-44 rounded-full bg-slate-800 ring-slate-800"
              alt="Your profile photo"
              width={48}
              height={48}
            />
            <p className="text-2xl font-bold">@{data.username}</p>
          </div>
        </div>
      </PageLayout>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import Image from "next/image";
import Link from "next/link";
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
