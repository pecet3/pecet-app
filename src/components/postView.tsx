import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import { RouterOutputs } from "../utils/api";

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

export const PostView = ({ post, author }: PostWithUser) => {
  console.log(author);
  return (
    <div className="flex gap-2 border-b p-2">
      <Link href={`/@${author.username}`}>
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
          </Link>
        </div>
        <Link href={`/post/${post.id}`}>
          <span className="text-lg">{post.content}</span>
        </Link>
      </div>
    </div>
  );
};
