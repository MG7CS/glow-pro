import { Amplify } from "aws-amplify";
import config from "../amplifyconfiguration.json";

// The Amplify Storage resource was removed from the project, but the S3 bucket
// still exists. We inject the bucket name manually so that aws-amplify/storage
// APIs (uploadData, getUrl) know which bucket to target.
const STORAGE_PATCH = {
  aws_user_files_s3_bucket: "connectkigali-business-photosd0008-dev",
  aws_user_files_s3_bucket_region: "us-east-1",
};

export const configureAmplify = (): void => {
  Amplify.configure({ ...config, ...STORAGE_PATCH });
};
