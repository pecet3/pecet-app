import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { SignUp, useUser, SignOutButton } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { RouterOutputs } from "../utils/api";
import { LoadingSpinner, LoadingFullPage } from "../components/loading";

dayjs.extend(relativeTime);

const CreatePostWizzard = () => {
  const { user } = useUser();

  console.log(user);

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
      <Image
        src={author.profilePicture}
        alt={`@${author.username}'s avatar`}
        className="h-12 w-12 rounded-full"
        width={48}
        height={48}
      />
      <div className="flex flex-col">
        <div className="flex gap-1 text-sm text-slate-300">
          <span className="font-bold">{`@${author.username}`}</span>
          <span className="font-thin">{`∙ ${dayjs(
            post.createdAt
          ).fromNow()}`}</span>
        </div>
        <span className="text-lg">{post.content}</span>
      </div>
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
        <PostView {...fullPost} key={fullPost.post.id} />
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
      <Head>
        <title>pecetApp</title>
        <meta name="description" content="pecet app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen items-center justify-center">
        <div className="h-full w-full border-x border-slate-400 bg-slate-800 md:max-w-2xl">
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
        </div>
      </main>
    </>
  );
}
