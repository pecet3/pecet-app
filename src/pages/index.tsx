import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { SignUp, useUser, SignOutButton } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { RouterOutputs } from "../utils/api";
import { PostView } from "~/components/postView";
import { toast } from "react-hot-toast";
import { LoadingSpinner, LoadingFullPage } from "../components/loading";
import PageLayout from "./layout";

dayjs.extend(relativeTime);

const emojiList = [
  {
    value: "😐",
    id: 1,
  },
  {
    value: "😤",
    id: 2,
  },
  {
    value: "😠",
    id: 3,
  },
  {
    value: "😡",
    id: 4,
  },
  {
    value: "🤬",
    id: 5,
  },
];

const CreatePostWizzard = () => {
  const [input, setInput] = useState<{ content: string; emoji: string }>({
    content: "",
    emoji: "1",
  });
  const [counter, setCounter] = useState<number>(input.content.length);

  const maxInputLength = 280;

  const { user } = useUser();

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput({
        content: "",
        emoji: "",
      });
      void ctx.posts.getAll.invalidate();
      toast.success("You added a post!");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;
      console.log("zodError", errorMessage);

      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post, try again later");
      }
    },
  });

  useEffect(() => {
    setCounter(input.content.length);
  }, [input]);

  if (!user) return null;

  return (
    <div className="flex w-full gap-2">
      <Image
        src={user.profileImageUrl}
        className="h-16 w-16 rounded-full"
        alt="Your profile photo"
        width={48}
        height={48}
      />
      <input
        placeholder="Type something"
        type="text"
        className="grow bg-transparent outline-none"
        value={input.content}
        onChange={(e) =>
          setInput({
            content: e.target.value,
            emoji: "1",
          })
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (input.content !== "") {
              mutate({ content: input.content, emoji: input.emoji });
            }
          }
        }}
      />
      {input.content !== "" && !isPosting ? (
        <div className="flex flex-col items-center self-end">
          <div className="flex">
            {emojiList.map((emoji) => (
              <button key={emoji.id}>{emoji.value}</button>
            ))}
          </div>
          <button
            className="m-auto rounded-md bg-slate-500 p-1 transition-all duration-300 hover:bg-slate-400"
            onClick={() =>
              mutate({ content: input.content, emoji: input.emoji })
            }
            disabled={counter > maxInputLength || isPosting}
          >
            Submit
          </button>
          <p
            className={`text-xs ${
              counter > maxInputLength ? "text-red-400" : ""
            }`}
          >
            {counter} / {maxInputLength}
          </p>
        </div>
      ) : null}
      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={24} />
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postLoading } = api.posts.getAll.useQuery();
  if (postLoading) return <LoadingFullPage />;
  if (!data) return <div>Ups...Something went wrong</div>;
  return (
    <div className="flex flex-col gap-2">
      {data?.map((fullPost) => (
        <PostView
          post={fullPost.post}
          author={fullPost.author}
          key={fullPost.post.id}
        />
      ))}
    </div>
  );
};
export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  //start fetching asap
  api.posts.getAll.useQuery();

  if (!userLoaded) return <LoadingFullPage />;

  return (
    <>
      <PageLayout>
        <div className="border-b border-slate-400 p-2">
          {!isSignedIn && (
            <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
          )}
          {isSignedIn && (
            <>
              <SignOutButton />
              <CreatePostWizzard />
            </>
          )}
        </div>
        <Feed />
      </PageLayout>
    </>
  );
}
