import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import { RouterOutputs } from "../utils/api";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = ({ post, author }: PostWithUser) => {
  console.log(post);
  return (
    <div className="flex justify-start gap-2 border-b p-2">
      <Link href={`/@${author.username}`} className="w-12">
        <Image
          src={author.profilePicture}
          alt={`@${author.username}'s avatar`}
          className="h-12 w-12 rounded-full"
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
            <span className="mx-1 font-thin">{`- ${post.emoji}`}</span>
          </Link>
        </div>
        <Link href={`/post/${post.id}`} className="max-w-xs sm:max-w-xl">
          <span className="text-lg">{post.content}</span>
        </Link>
      </div>
    </div>
  );
};
