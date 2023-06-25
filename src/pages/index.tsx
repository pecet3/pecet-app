import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { SignUp, useUser, SignOutButton } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { RouterOutputs } from "../utils/api";
import { toast } from "react-hot-toast";
import { LoadingSpinner, LoadingFullPage } from "../components/loading";

dayjs.extend(relativeTime);

const CreatePostWizzard = () => {
  const router = useRouter();
  const [input, setInput] = useState<string>("");
  const [counter, setCounter] = useState<number>(input.length);
  const maxInputLength = 280;

  const { user } = useUser();

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate;
      toast.success("You added the post");
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

  console.log(user);

  useEffect(() => {
    setCounter(input.length);
  }, [input]);

  const handleClick = () => {
    mutate({ content: input });
  };

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
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="flex flex-col items-center self-end">
        <button
          className="m-auto rounded-md bg-slate-500 p-1 transition-all duration-300 hover:bg-slate-400"
          onClick={handleClick}
          disabled={counter >= maxInputLength || isPosting}
        >
          Submit
        </button>
        <p
          className={`text-xs ${
            counter >= maxInputLength ? "text-red-400" : ""
          }`}
        >
          {counter} / {maxInputLength}
        </p>
      </div>
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
        <div className="h-full w-full overflow-y-scroll border-x border-slate-400 bg-slate-800 md:max-w-2xl">
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
