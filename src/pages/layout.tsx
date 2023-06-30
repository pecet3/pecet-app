import { type PropsWithChildren } from "react";

const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="background flex h-screen items-center justify-center">
      <div className="h-full w-full overflow-y-scroll border-x border-slate-400 bg-slate-800 md:max-w-2xl">
        {props.children}
      </div>
    </main>
  );
};

export default PageLayout;
