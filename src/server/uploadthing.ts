import type { NextApiRequest, NextApiResponse } from "next";

import { createUploadthing, type FileRouter } from "uploadthing/next-legacy";

const f = createUploadthing();

const auth = (req: NextApiRequest, res: NextApiResponse) => ({ id: "fakeId" }); // Fake auth function


export const ourFileRouter = {

    imageUploader: f({ image: { maxFileSize: "4MB" } })
        .onUploadComplete(({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload
            // console.log("Upload complete for userId:", metadata.userId);

            console.log("file url", file.url);
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;