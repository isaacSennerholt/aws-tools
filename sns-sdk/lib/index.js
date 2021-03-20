const AwsSdk = require('aws-sdk')

function configure({ region, endpoint = '' }) {
  const awsEndpointParameter = endpoint || `sns.${region}.amazonaws.com`
  const awsEndpoint = new AwsSdk.Endpoint(awsEndpointParameter)
  const awsSns = new AwsSdk.SNS({ region, endpoint: awsEndpoint })

  return {
    publishToTopic: async ({ topicArn, message }) => {
      const parameters = {
        TopicArn: topicArn,
        Message: message,
      }
      return await awsSns.publish(parameters).promise()
    },
  }
}

module.exports = { configure }
