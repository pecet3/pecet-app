import { generateComponents } from "@uploadthing/react";
import { useDropzone } from "react-dropzone";

import type { OurFileRouter } from "~/server/uploadthing";

export const { UploadButton, UploadDropzone, Uploader } =
    generateComponents<OurFileRouter>();