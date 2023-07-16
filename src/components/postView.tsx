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
import { IoMdAddCircleOutline } from "react-icons/io";
import { FaRegComments } from "react-icons/fa";

dayjs.extend(relativeTime);
type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = ({ post, author }: PostWithUser) => {
  const { user } = useUser();
  const ctx = api.useContext();
  console.log(post);
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
    <div className="m-1 rounded-md bg-slate-700  shadow-md shadow-slate-500 sm:m-2 sm:shadow-md ">
      <div className="flex items-end">
        <div className="flex justify-start gap-2 px-1 pt-1 md:px-2 md:pt-2">
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
      </div>
      <Link
        href={`/post/${post.id}`}
        className="m-auto mb-1 flex justify-end gap-2"
      >
        <span className="flex items-center justify-center text-xs">
          <IoMdAddCircleOutline size={16} className="text-green-500" />
          Add a comment
        </span>
        <span className="mr-1 flex items-center justify-center text-right text-xs">
          <FaRegComments size={16} className="mr-1 text-blue-500" />
          Comments({post.comments})
        </span>
      </Link>
    </div>
  );
};
