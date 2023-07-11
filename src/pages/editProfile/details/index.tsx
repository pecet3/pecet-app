import React from "react";
import { UserProfile } from "@clerk/nextjs";
import "@uploadthing/react/styles.css";
import Head from "next/head";

const EditProfileDetailsPage = () => {
  return (
    <>
      <Head>
        <title>Edit a profile</title>
        <meta name="description" content={`pecet app`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="background m-auto flex justify-center">
        <UserProfile />
      </main>
    </>
  );
};

export default EditProfileDetailsPage;
