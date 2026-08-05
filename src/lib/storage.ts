import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadTask,
} from "firebase/storage";
import { storage } from "./firebase";

// ===== File Size Limits (bytes) =====
export const FILE_SIZE_LIMITS: Record<string, number> = {
  mp3: 20 * 1024 * 1024,       // 20MB
  wav: 100 * 1024 * 1024,      // 100MB
  flac: 150 * 1024 * 1024,     // 150MB
  stems: 500 * 1024 * 1024,    // 500MB (ZIP)
  cover: 5 * 1024 * 1024,      // 5MB
};

// ===== Accepted MIME Types =====
export const ACCEPTED_AUDIO_TYPES: Record<string, string[]> = {
  mp3: ["audio/mpeg", "audio/mp3"],
  wav: ["audio/wav", "audio/wave", "audio/x-wav"],
  flac: ["audio/flac", "audio/x-flac"],
  stems: ["application/zip", "application/x-zip-compressed"],
};

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

// ===== Upload Progress Callback =====
export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percent: number;
  state: "running" | "paused" | "success" | "error";
}

export type OnProgressCallback = (progress: UploadProgress) => void;

// ===== Upload Beat Audio File =====
export function uploadBeatFile(
  file: File,
  producerId: string,
  beatId: string,
  format: string,
  onProgress?: OnProgressCallback
): { task: UploadTask; promise: Promise<string> } {
  const ext = file.name.split(".").pop() || format;
  const storageRef = ref(storage, `beats/${producerId}/${beatId}/${format}.${ext}`);

  const metadata = {
    contentType: file.type,
    customMetadata: {
      producerId,
      beatId,
      format,
      originalName: file.name,
    },
  };

  const task = uploadBytesResumable(storageRef, file, metadata);

  const promise = new Promise<string>((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          percent,
          state: snapshot.state as UploadProgress["state"],
        });
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });

  return { task, promise };
}

// ===== Upload Cover Art =====
export function uploadCoverArt(
  file: File,
  producerId: string,
  beatId: string,
  onProgress?: OnProgressCallback
): { task: UploadTask; promise: Promise<string> } {
  const ext = file.name.split(".").pop() || "jpg";
  const storageRef = ref(storage, `covers/${producerId}/${beatId}/cover.${ext}`);

  const metadata = {
    contentType: file.type,
    customMetadata: {
      producerId,
      beatId,
    },
  };

  const task = uploadBytesResumable(storageRef, file, metadata);

  const promise = new Promise<string>((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
          percent,
          state: snapshot.state as UploadProgress["state"],
        });
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });

  return { task, promise };
}

// ===== Get Download URL =====
export async function getBeatDownloadUrl(
  producerId: string,
  beatId: string,
  format: string
): Promise<string | null> {
  try {
    // List files to find the correct one (format may have different extensions)
    const folderRef = ref(storage, `beats/${producerId}/${beatId}`);
    const result = await listAll(folderRef);
    const match = result.items.find((item) => item.name.startsWith(`${format}.`));

    if (match) {
      return await getDownloadURL(match);
    }
    return null;
  } catch {
    return null;
  }
}

// ===== Delete All Beat Files =====
export async function deleteBeatFiles(
  producerId: string,
  beatId: string
): Promise<void> {
  try {
    // Delete audio files
    const audioRef = ref(storage, `beats/${producerId}/${beatId}`);
    const audioResult = await listAll(audioRef);
    await Promise.all(audioResult.items.map((item) => deleteObject(item)));

    // Delete cover art
    const coverRef = ref(storage, `covers/${producerId}/${beatId}`);
    const coverResult = await listAll(coverRef);
    await Promise.all(coverResult.items.map((item) => deleteObject(item)));
  } catch {
    // Files may not exist yet
  }
}

// ===== Validate File =====
export function validateFile(
  file: File,
  format: string
): { valid: boolean; error?: string } {
  const maxSize = FILE_SIZE_LIMITS[format];
  if (maxSize && file.size > maxSize) {
    const maxMB = Math.round(maxSize / (1024 * 1024));
    return { valid: false, error: `File exceeds ${maxMB}MB limit for ${format.toUpperCase()}` };
  }

  if (format === "cover") {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return { valid: false, error: "Cover art must be JPEG, PNG, or WebP" };
    }
  } else {
    const acceptedTypes = ACCEPTED_AUDIO_TYPES[format];
    if (acceptedTypes && !acceptedTypes.includes(file.type)) {
      return { valid: false, error: `Invalid file type for ${format.toUpperCase()}` };
    }
  }

  return { valid: true };
}

// ===== Format File Size =====
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
