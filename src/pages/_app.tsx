import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import Head from "next/head";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider>
      <Head>
        <title>pecetApp</title>
        <meta name="description" content="pecet app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster position="bottom-center" />
      <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
