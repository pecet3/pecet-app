import { api } from "~/utils/api";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SignUp, useUser, SignOutButton } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import PageLayout from "../layout";

const EditProfilePage = () => {
  const { user } = useUser();
  const { push } = useRouter();
  const [counter, setCounter] = useState(0);
  const maxLength = 280;

  const [input, setInput] = useState({
    description: "",
  });

  useEffect(() => {
    setCounter(input.description.length);
  }, [input]);

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.profile.editMetadata.useMutation(
    {
      onSuccess: () => {
        setInput({
          description: "",
        });
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
    }
  );
  if (!user) return <p>Unauthorized</p>;
  return (
    <main className="background flex h-screen items-center justify-center">
      <div className="flex flex-col items-center justify-center rounded-lg bg-slate-700 p-4">
        <div className="flex flex-col items-center justify-center gap-1">
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            Edit your description
          </label>
          <textarea
            onChange={(e) => setInput({ description: e.target.value })}
            id="description"
            rows={4}
            className="block w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm
             text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700
              dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500
              dark:focus:ring-blue-500"
            placeholder={
              (user.publicMetadata.description as string) ||
              "write rour description"
            }
          ></textarea>
          <p>
            {counter}/{maxLength}
          </p>
          <div className="flex">
            <button
              onClick={() =>
                mutate({ description: input.description, userId: user?.id })
              }
              className="m-auto rounded-md bg-slate-500 px-1"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditProfilePage;
