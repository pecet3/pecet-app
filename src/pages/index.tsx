import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { SignUp, useUser, SignOutButton } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { PostView } from "~/components/postView";
import { toast } from "react-hot-toast";
import { LoadingSpinner, LoadingFullPage } from "../components/loading";
import { BiLogoPostgresql } from "react-icons/bi";
import PageLayout from "./layout";

dayjs.extend(relativeTime);

const emojiList = [
  {
    value: "😐",
    id: 1,
  },
  {
    value: "😠",
    id: 2,
  },
  {
    value: "😡",
    id: 3,
  },
  {
    value: "🤬",
    id: 4,
  },
];

const CreatePostWizzard = () => {
  const [input, setInput] = useState<{ content: string; emoji: string }>({
    content: "",
    emoji: "😐",
  });
  const [counter, setCounter] = useState<number>(input.content.length);

  const maxInputLength = 280;

  const { user } = useUser();

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput({
        content: "",
        emoji: "😐",
      });
      void ctx.posts.getAll.invalidate();
      toast.success("You added the post!");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;

      if (errorMessage && errorMessage[0]) {
        console.log("zodError", errorMessage[0]);
        toast.error(errorMessage[0]);
      } else {
        toast.error("You can add one post per hour");
      }
    },
  });

  useEffect(() => {
    setCounter(input.content.length);
  }, [input]);

  if (!user) return null;

  return (
    <div className="flex w-full items-center justify-center gap-1 md:gap-2">
      <Link href={`/@${user.username ?? ""}`}>
        <Image
          src={user.profileImageUrl}
          className={`mt-1 h-12 w-12 rounded-full md:h-16 md:w-16 ${
            input.content ? "hidden md:flex" : ""
          }`}
          alt="Your profile photo"
          width={64}
          height={64}
        />
      </Link>
      <input
        placeholder="Type something"
        type="text"
        className="grow bg-transparent outline-none"
        value={input.content}
        onChange={(e) =>
          setInput(
            (prev) =>
              (prev = {
                ...prev,
                content: e.target.value,
              })
          )
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
        <>
          <div className="flex flex-col items-center gap-1 self-end">
            <div className="m-auto flex flex-wrap justify-center rounded-lg bg-slate-600">
              {emojiList.map((emoji) => (
                <button
                  key={emoji.id}
                  className={`${
                    emoji.value === input.emoji ? "rounded-md bg-slate-400" : ""
                  }`}
                  onClick={() =>
                    setInput(
                      (prev) =>
                        (prev = {
                          ...prev,
                          emoji: emoji.value,
                        })
                    )
                  }
                >
                  {emoji.value}
                </button>
              ))}
            </div>
            <div className="flex flex-col items-center gap-1 md:flex-row">
              <button
                className="m-auto rounded-md bg-slate-500 p-1 text-sm transition-all duration-300 hover:bg-slate-400 md:text-base"
                onClick={() =>
                  mutate({ content: input.content, emoji: input.emoji })
                }
                disabled={counter > maxInputLength || isPosting}
              >
                Submit
              </button>
              <p
                className={`text-[10px] ${
                  counter > maxInputLength ? "text-red-400" : ""
                }`}
              >
                {counter}/{maxInputLength}
              </p>
            </div>
          </div>
        </>
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
              <nav className="flex justify-start gap-2 text-xs ">
                <div className=" flex w-16 justify-center rounded-md bg-slate-700 text-slate-200">
                  <SignOutButton />
                </div>
                <span className="rounded-md bg-slate-700 p-1 text-slate-200">
                  <Link href="/editProfile">Edit a profile</Link>
                </span>

                <BiLogoPostgresql size={24} />
              </nav>
              <CreatePostWizzard />
            </>
          )}
        </div>
        <Feed />
      </PageLayout>
    </>
  );
}
