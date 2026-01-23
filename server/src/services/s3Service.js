const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const region = process.env.AWS_REGION || 'ap-south-1';
const bucket = process.env.S3_BUCKET_NAME;

function buildS3Client() {
  const config = { region };

  if (process.env.AWS_S3_ENDPOINT) {
    config.endpoint = process.env.AWS_S3_ENDPOINT;
    config.forcePathStyle = true;
  }

  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    config.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    };
  }

  return new S3Client(config);
}

function buildPublicUrl(key) {
  if (process.env.S3_PUBLIC_BASE_URL) {
    return `${process.env.S3_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`;
  }

  if (process.env.AWS_S3_ENDPOINT) {
    const base = process.env.AWS_S3_ENDPOINT.replace(/\/$/, '');
    return `${base}/${bucket}/${key}`;
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

async function createPresignedPutUrl({ key, contentType }) {
  if (!bucket) {
    const error = new Error('S3 bucket not configured');
    error.status = 500;
    throw error;
  }

  const client = buildS3Client();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType
  });

  const url = await getSignedUrl(client, command, { expiresIn: 300 });
  return { url, key, publicUrl: buildPublicUrl(key) };
}

module.exports = { createPresignedPutUrl, buildPublicUrl };
