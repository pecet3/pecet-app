import Head from "next/head";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { SignUp, useUser, SignOutButton } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { RouterOutputs } from "../utils/api";

dayjs.extend(relativeTime);

const CreatePostWizzard = () => {
  const { user } = useUser();

  console.log(user);

  if (!user) return null;

  return (
    <div className="flex w-full gap-2">
      <img
        src={user.profileImageUrl}
        className="h-16 w-16 rounded-full"
        alt="Your profile photo"
      />
      <input
        placeholder="Type something"
        className="grow bg-transparent outline-none"
      />
    </div>
  );
};

type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div className="flex gap-2 border-b p-2">
      <img
        src={author.profilePicture}
        alt={`${author.username} avatar`}
        className="h-12 w-12 rounded-full"
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-sm text-slate-300">
          <span className="font-bold">{`@${author.username}`}</span>
          <span className="font-thin">{`∙ ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </div>
        <span>{post.content}</span>
      </div>
    </div>
  );
};
export default function Home() {
  const user = useUser();

  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) return <div>Loading</div>;

  return (
    <>
      <Head>
        <title>pecetApp</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen items-center justify-center">
        <div className="h-full w-full border-x border-slate-400 bg-slate-800 md:max-w-2xl">
          <div className="border-b border-slate-400 p-2">
            {!user.isSignedIn && (
              <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
            )}
            {!!user.isSignedIn && (
              <>
                <SignOutButton />
                <CreatePostWizzard />
              </>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {data?.map((fullPost) => (
              <PostView {...fullPost} key={fullPost.post.id} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
