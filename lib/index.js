const AwsSdk = require('aws-sdk')

function configure({ region, endpoint = '' }) {
  const awsEndpointParameter = endpoint || `s3.${region}.amazonaws.com`
  const awsEndpoint = new AwsSdk.Endpoint(awsEndpointParameter)
  const awsS3 = new AwsSdk.S3({ region, endpoint: awsEndpoint })

  return {
    createBucketObject: async ({
      bucket,
      key,
      body,
      contentEncoding,
      contentType
    }) => {
      const parameters = {
        Bucket: bucket,
        Key: key,
        Body: body,
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
    uploadToBucket: async ({
      bucket,
      key,
      body,
      contentEncoding,
      contentType
    }) => {
      const parameters = {
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentEncoding: contentEncoding,
        ContentType: contentType
      }
      return await awsS3.upload(parameters).promise()
    },
  }
}

module.exports = { configure }
