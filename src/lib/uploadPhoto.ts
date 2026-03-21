import { uploadData, getUrl } from "aws-amplify/storage";

// Bucket & region from amplifyconfiguration.json — aws_user_files_s3_bucket
const S3_BASE =
  "https://connectkigali-business-photosd0008-dev.s3.us-east-1.amazonaws.com";

/**
 * Upload a single photo to S3 and return its public URL.
 *
 * Accepts:
 *  - blob: URL  (e.g. URL.createObjectURL(file))  → fetched and uploaded
 *  - https:// URL already on S3                   → returned as-is (no re-upload)
 *  - null / empty string                          → returns null
 */
export async function uploadPhoto(
  blobOrUrl: string | null | undefined,
  storagePath: string
): Promise<string | null> {
  if (!blobOrUrl) return null;

  // Already an S3 URL — nothing to do
  if (blobOrUrl.startsWith("https://") || blobOrUrl.startsWith("http://")) {
    return blobOrUrl;
  }

  // Blob URL — read the in-memory file and push to S3
  if (blobOrUrl.startsWith("blob:")) {
    try {
      const resp = await fetch(blobOrUrl);
      const blob = await resp.blob();
      const ext = blob.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
      const fullPath = `public/${storagePath}.${ext}`;

      await uploadData({
        path: fullPath,
        data: blob,
        options: { contentType: blob.type },
      }).result;

      return `${S3_BASE}/${fullPath}`;
    } catch (err) {
      console.error("S3 upload failed:", err);
      return null;
    }
  }

  return null;
}

/**
 * Resolve a stored S3 value (full URL or path) to a pre-signed URL that
 * works regardless of bucket "Block Public Access" settings.
 *
 * - blob: URLs are returned as-is (local preview, no S3 involvement)
 * - Full S3 https:// URLs: the path is extracted and re-signed
 * - Raw S3 paths (public/...): signed directly
 * - null / empty: returns empty string
 */
export async function resolvePhotoUrl(
  storedValue: string | null | undefined
): Promise<string> {
  if (!storedValue) return "";
  if (storedValue.startsWith("blob:")) return storedValue;

  // Extract path segment from full S3 URL  e.g. "public/covers/abc.jpg"
  let path = storedValue;
  if (storedValue.includes(".amazonaws.com/")) {
    const match = storedValue.match(/\.amazonaws\.com\/([^?]+)/);
    if (match) path = match[1];
  }

  try {
    const { url } = await getUrl({
      path,
      options: { expiresIn: 3600 }, // 1-hour pre-signed URL; refreshed on each fetch
    });
    return url.href;
  } catch {
    // Fall back to the raw URL if getUrl fails (e.g. offline)
    return storedValue;
  }
}

/**
 * Upload multiple gallery photos and return their public URLs.
 * Already-uploaded URLs are passed through unchanged.
 */
export async function uploadGallery(
  blobOrUrls: string[],
  shopId: string
): Promise<string[]> {
  const results = await Promise.all(
    blobOrUrls.map((url, i) =>
      uploadPhoto(url, `gallery/${shopId}_${i}`)
    )
  );
  return results.filter((u): u is string => !!u);
}
