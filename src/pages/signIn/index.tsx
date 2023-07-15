import React from "react";
import { SignUp } from "@clerk/nextjs";
import "@uploadthing/react/styles.css";
import Head from "next/head";

const SignInPage = () => {
  return (
    <>
      <Head>
        <title>Edit a profile</title>
        <meta name="description" content={`pecet app`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
    </>
  );
};

export default SignInPage;
