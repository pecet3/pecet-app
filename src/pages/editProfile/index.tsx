import { api } from "~/utils/api";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SignUp, useUser, SignOutButton } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import PageLayout from "../layout";
import { UploadDropzone, UploadButton } from "~/utils/uploadthing";
import "@uploadthing/react/styles.css";
import Head from "next/head";
import Image from "next/image";
import { FiEdit } from "react-icons/fi";
import { BackArrow } from "../../components/backArrow";

const EditProfilePage = () => {
  const { user } = useUser();
  const { push } = useRouter();
  const [counter, setCounter] = useState(0);
  const maxLength = 280;

  const [input, setInput] = useState({
    description: "",
    backgroundImg: "",
  });

  useEffect(() => {
    setCounter(input.description.length);
  }, [input]);

  const ctx = api.useContext();

  const { data } = api.profile?.getUserById.useQuery({
    userId: user?.id as string,
  });

  const { mutate: mutateBackground, isLoading } =
    api.profile.updateBackground.useMutation({
      onSuccess: () => {
        setInput(
          (prev) =>
            (prev = {
              ...prev,
              backgroundImg: "",
            })
        );
        toast.success("You eddited your profile!");
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;

        if (errorMessage && errorMessage[0]) {
          console.log("zodError", errorMessage[0]);
          toast.error(errorMessage[0]);
        } else {
          toast.error("Ups something went wrong");
        }
      },
    });

  const { mutate, isLoading: isPosting } =
    api.profile.updateDescription.useMutation({
      onSuccess: () => {
        setInput(
          (prev) =>
            (prev = {
              ...prev,
              description: "",
            })
        );
        toast.success("You eddited your profile!");
      },
      onError: (e) => {
        const errorMessage = e.data?.zodError?.fieldErrors.content;

        if (errorMessage && errorMessage[0]) {
          console.log("zodError", errorMessage[0]);
          toast.error(errorMessage[0]);
        } else {
          toast.error("Ups something went wrong");
        }
      },
    });
  if (!user) return <p>Unauthorized</p>;
  if (!data) return <p>Error</p>;
  return (
    <>
      <Head>
        <title>Edit a profile</title>
        <meta name="description" content={`pecet app`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className="relative  flex h-60 flex-col bg-slate-800 p-0 ">
          <Image
            width={1200}
            height={720}
            src={
              data.backgroundImg ??
              "https://images2.alphacoders.com/941/thumb-1920-941898.jpg"
            }
            className="fill h-full bg-slate-800 opacity-50 ring-slate-800 blur-sm"
            alt="Your profile photo"
          />
          <div className="absolute right-0 top-6">
            <div className="relative flex justify-center ">
              <FiEdit size={32} className="absolute top-2" />
              <div className="opacity-0">
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    // Do something with the response
                    // console.log("Files: ", res);
                    // alert("Upload Completed");
                    if (typeof res === "undefined") return;
                    const url = res[0]?.fileUrl as string;
                    mutateBackground({
                      backgroundImg: url,
                      userId: user?.id,
                    });
                  }}
                  onUploadError={(error: Error) => {
                    // Do something with the error.
                    alert(`ERROR! ${error.message}`);
                  }}
                />
              </div>
            </div>
          </div>
          <div className="absolute left-1/4 top-36 m-auto flex flex-col items-center justify-center self-start sm:left-8 md:left-2">
            <Image
              src={data.profilePicture}
              className="h-44 w-44 rounded-full bg-slate-700 ring-2 ring-slate-700"
              alt="Your profile photo"
              width={128}
              height={128}
            />
            <p className="text-xl font-bold md:text-2xl">@{data.username}</p>
          </div>
          <BackArrow />
        </div>
        <div className="m-auto mt-24 flex items-center justify-center p-2 text-sm sm:mb-12 sm:ml-48 sm:mt-4  md:text-base">
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="m-auto flex flex-col items-center justify-center">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
              >
                Edit your description
              </label>
              <textarea
                onChange={(e) =>
                  setInput(
                    (prev) => (prev = { ...prev, description: e.target.value })
                  )
                }
                id="description"
                rows={4}
                className="block w-56 resize-none rounded-lg border  border-gray-600 bg-gray-700
              p-2.5 text-sm
              text-white placeholder-gray-400 focus:border-blue-500
              focus:ring-blue-500"
                placeholder={
                  (user.publicMetadata.description as string) ||
                  "write rour description"
                }
              ></textarea>
            </div>
            <div className="m-auto flex justify-around gap-1">
              <button
                onClick={() =>
                  mutate({ description: input.description, userId: user?.id })
                }
                className="ml-10 rounded-md bg-slate-500 px-2"
              >
                Update
              </button>

              <p>
                {counter}/{maxLength}
              </p>
            </div>
          </div>
        </div>
        {/* <div className="m-auto flex max-w-[14rem] flex-col items-center justify-center gap-1 rounded-lg bg-slate-500 bg-opacity-70 p-2 text-center">
          <span>Update your Background Image</span>
          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              // Do something with the response
              // console.log("Files: ", res);
              // alert("Upload Completed");
              if (typeof res === "undefined") return;
              const url = res[0]?.fileUrl as string;
              mutateBackground({
                backgroundImg: url,
                userId: user?.id,
              });
            }}
            onUploadError={(error: Error) => {
              // Do something with the error.
              alert(`ERROR! ${error.message}`);
            }}
          />
        </div> */}
      </PageLayout>
    </>

    // <main className="background flex h-screen items-center justify-center">
    //   <div className="flex flex-col items-center justify-center rounded-lg bg-slate-700 p-4">
    // <div className="flex flex-col items-center justify-center gap-1">
    //   <label
    //     htmlFor="description"
    //     className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
    //   >
    //     Edit your description
    //   </label>
    //   <textarea
    //     onChange={(e) =>
    //       setInput(
    //         (prev) => (prev = { ...prev, description: e.target.value })
    //       )
    //     }
    //     id="description"
    //     rows={4}
    //     className="block w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm
    //      text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700
    //       dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
    //       dark:focus:ring-blue-500"
    //     placeholder={
    //       (user.publicMetadata.description as string) ||
    //       "write rour description"
    //     }
    //   ></textarea>
    //   <p>
    //     {counter}/{maxLength}
    //   </p>
    //   <div className="flex">
    //     <button
    //       onClick={() =>
    //         mutate({ description: input.description, userId: user?.id })
    //       }
    //       className="m-auto rounded-md bg-slate-500 px-1"
    //     >
    //       Submit
    //     </button>
    //   </div>
    // </div>
    //     <div className="flex flex-col items-center justify-center gap-1">
    //       <label
    //         htmlFor="description"
    //         className="my -2 block text-sm font-medium text-gray-900 dark:text-white"
    //       >
    //         Change your URL Image
    //       </label>
    //       <div className="flex gap-2">
    //         <input
    //           type="text"
    //           onChange={(e) =>
    //             setInput(
    //               (prev) => (prev = { ...prev, backgroundImg: e.target.value })
    //             )
    //           }
    //           id="background-url"
    //           className="block w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm
    //          text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700
    //           dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
    //           dark:focus:ring-blue-500"
    //           placeholder="paste a URL "
    //         />
    //         <div className="flex">
    // <UploadButton
    //   endpoint="imageUploader"
    //   onClientUploadComplete={(res) => {
    //     // Do something with the response
    //     // console.log("Files: ", res);
    //     // alert("Upload Completed");
    //     if (typeof res === "undefined") return;
    //     const url = res[0]?.fileUrl as string;
    //     mutateBackground({
    //       backgroundImg: url,
    //       userId: user?.id,
    //     });
    //   }}
    //   onUploadError={(error: Error) => {
    //     // Do something with the error.
    //     alert(`ERROR! ${error.message}`);
    //   }}
    // />
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </main>
  );
};

export default EditProfilePage;
