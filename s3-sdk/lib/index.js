const AwsSdk = require('aws-sdk')

function configure({ region, endpoint = '' }) {
  const awsEndpointParameter = endpoint || `s3.${region}.amazonaws.com`
  const awsEndpoint = new AwsSdk.Endpoint(awsEndpointParameter)
  const awsS3 = new AwsSdk.S3({ region, endpoint: awsEndpoint })

  return {
    createBucketObject: async ({
      body,
      bucket,
      key,
      contentEncoding,
      contentType
    }) => {
      const parameters = {
        Body: body,
        Bucket: bucket,
        Key: key,
        ContentEncoding: contentEncoding,
        ContentType: contentType
      }
      return await awsS3.putObject(parameters).promise()
    },
    getBucketObject: async ({ bucket, key }) => {
      const parameters = {
        Bucket: bucket,
        Key: key,
      }
      return await awsS3.getObject(parameters).promise()
    },
    uploadToBucket: async ({ body, bucket, key }) => {
      const parameters = {
        Body: body,
        Bucket: bucket,
        Key: key,
      }
      return await awsS3.upload(parameters).promise()
    },
  }
}

module.exports = { configure }
