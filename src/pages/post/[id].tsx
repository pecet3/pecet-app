import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { SignUp, useUser, SignOutButton } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { RouterOutputs } from "~/utils/api";
import { toast } from "react-hot-toast";
import { LoadingSpinner, LoadingFullPage } from "~/components/loading";
import { PostView } from "~/components/postView";
import { useRouter } from "next/router";
dayjs.extend(relativeTime);

const Feed = (props: { userId: string }) => {
  console.log(props.userId);
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });
  console.log(data);
  if (isLoading)
    return (
      <div className="mt-28 flex items-center justify-center">
        <LoadingSpinner size={64} />
      </div>
    );

  if (!data || data.length === 0) return <p>error</p>;
  return (
    <div className="mt-32 flex flex-col gap-2">
      {data?.map((fullpost) => (
        <PostView
          post={fullpost.post}
          author={fullpost.author}
          key={fullpost.post.id}
        />
      ))}
    </div>
  );
};
export default function PostPage() {
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
        <PostView post={post} author={author} />
      </main>
    </>
  );
}
