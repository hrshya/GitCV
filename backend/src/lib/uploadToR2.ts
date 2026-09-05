import fs from "fs";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "./r2Client.js";

export async function uploadPDFToR2(
  filePath: string,
  key: string
): Promise<string> {
  const fileBuffer = fs.readFileSync(filePath);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: fileBuffer,
      ContentType: "application/pdf",
    })
  );

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
