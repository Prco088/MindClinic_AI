import { r2 } from "@/lib/r2";
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

export const r2Service = {
  /**
   * Generates a pre-signed URL for uploading a file directly to R2 from the client.
   */
  async getSignedUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });
    
    return await getSignedUrl(r2, command, { expiresIn });
  },

  /**
   * Generates a pre-signed URL for downloading a file securely.
   */
  async getSignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    
    return await getSignedUrl(r2, command, { expiresIn });
  },

  /**
   * Deletes a file from R2.
   */
  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await r2.send(command);
  },
};
