import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import { RouterOutputs } from "../utils/api";
import relativeTime from "dayjs/plugin/relativeTime";
import { SignUp, useUser, SignOutButton } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

dayjs.extend(relativeTime);
type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = ({ post, author }: PostWithUser) => {
  const { user } = useUser();
  const ctx = api.useContext();

  const { mutate, isLoading: isDeleting } = api.posts.delete.useMutation({
    onSuccess: () => {
      void ctx.posts.getAll.invalidate();

      toast.success("You deleted the post!");
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;

      if (errorMessage && errorMessage[0]) {
        console.log("zodError", errorMessage[0]);
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to delete a post, try again later");
      }
    },
  });
  return (
    <div className="flex items-end border-b p-1">
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
                  mutate({ postId: post.id, authorId: author.id });
                }}
              >
                <i className="text-xs font-extralight text-slate-200">{` ∙`}</i>{" "}
                ❌delete
              </button>
            ) : null}
          </div>
          <Link
            href={`/post/${post.id}`}
            className="max-w-[15rem] grow sm:max-w-md md:max-w-lg"
          >
            <span className=" break-words text-base md:text-lg">
              {post.content}
            </span>
            <span className="mx-1 text-xl font-bold text-slate-400">{` ∙ ${
              post.emoji ?? "😐"
            }`}</span>
          </Link>
        </div>
      </div>
      <Link
        href={`/post/${post.id}`}
        className="max-w-[15rem] grow sm:max-w-md md:max-w-lg"
      >
        <p className="text-right">Comments({post.comments.length})</p>
      </Link>
    </div>
  );
};
