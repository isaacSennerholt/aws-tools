const AwsSdk = require('aws-sdk')

function configure({ region, endpoint = '' }) {
  const awsEndpointParameter = endpoint || `ssm.${region}.amazonaws.com`
  const awsEndpoint = new AwsSdk.Endpoint(awsEndpointParameter)
  const awsSsm = new AwsSdk.SSM({ region, endpoint: awsEndpoint })

  return {
    getParameterByName: async name => {
      const parameters = {
        Name: name,
        WithDecryption: true,
      }
      const data = await awsSsm.getParameter(parameters).promise()
      return data.Parameter.Value
    },
  }
}

module.exports = { configure }
