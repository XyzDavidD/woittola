"use client";

import * as tus from "tus-js-client";
import { createClient } from "@/lib/supabase/client";

export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const STANDARD_UPLOAD_LIMIT = 6 * 1024 * 1024;

export function formatFileSize(bytes: number) {
  return `${Math.round(bytes / 1024 / 1024)} MB`;
}

export function validateFileSize(file: File, maxBytes: number) {
  if (file.size > maxBytes) {
    throw new Error(`${file.name} is ${formatFileSize(file.size)}. The maximum allowed size is ${formatFileSize(maxBytes)}.`);
  }
}

function storageEndpoint() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) throw new Error("Supabase is not configured.");
  const url = new URL(supabaseUrl);
  const projectRef = url.hostname.split(".")[0];
  return `https://${projectRef}.storage.supabase.co/storage/v1/upload/resumable`;
}

async function resumableUpload(file: File, path: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) {
    throw new Error("Your administrator session expired. Sign in again before uploading files.");
  }

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: storageEndpoint(),
      retryDelays: [0, 1_000, 3_000, 5_000, 10_000],
      headers: {
        authorization: `Bearer ${data.session.access_token}`,
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: STANDARD_UPLOAD_LIMIT,
      metadata: {
        bucketName: "catalogue-media",
        objectName: path,
        contentType: file.type || "application/octet-stream",
        cacheControl: "3600",
      },
      onError: (reason) => reject(reason),
      onSuccess: () => resolve(),
    });

    upload.findPreviousUploads()
      .then((previousUploads) => {
        if (previousUploads.length) upload.resumeFromPreviousUpload(previousUploads[0]);
        upload.start();
      })
      .catch(reject);
  });
}

export async function uploadCatalogueFile(file: File, path: string) {
  const supabase = createClient();

  try {
    if (file.size > STANDARD_UPLOAD_LIMIT) {
      await resumableUpload(file, path);
    } else {
      const { error } = await supabase.storage.from("catalogue-media").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (error) throw error;
    }
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "Unknown upload error";
    throw new Error(`Could not upload ${file.name}. ${message}`);
  }

  return supabase.storage.from("catalogue-media").getPublicUrl(path).data.publicUrl;
}
