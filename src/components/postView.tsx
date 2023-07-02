import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import { RouterOutputs } from "../utils/api";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = ({ post, author }: PostWithUser) => {
  return (
    <div className="flex justify-start gap-2 border-b p-1 md:p-2">
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
        </div>
        <Link
          href={`/post/${post.id}`}
          className="max-w-[15rem] grow sm:max-w-sm"
        >
          <span className=" break-words text-base md:text-lg">
            {post.content}
          </span>
          <span className="mx-1 text-xl">{`- ${post.emoji ?? "😐"}`}</span>
        </Link>
      </div>
    </div>
  );
};
