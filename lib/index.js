const AwsSdk = require('aws-sdk')

function configure({ tableName, region, endpoint = '' }) {
  const endpointParameter = endpoint || `dynamodb.${region}.amazonaws.com`
  const awsEndpoint = new AwsSdk.Endpoint(endpointParameter)
  const awsDocumentClient = new AwsSdk.DynamoDB.DocumentClient({
    region,
    endpoint: awsEndpoint,
  })

  return {
    create: async payload => {
      const parameters = {
        TableName: tableName,
        Item: payload,
        ConditionExpression: 'attribute_not_exists(id)',
        ReturnValues: 'NONE',
      }
      await awsDocumentClient.put(parameters).promise()

      return payload
    },
    updateById: async (id, payload) => {
      const updateExpression = Object.keys(payload).reduce(
        (expression, key) => {
          const keyExpression = `#${key} = :${key}`
          !expression
            ? (expression = `set ${keyExpression}`)
            : (expression = expression + `, ${keyExpression}`)

          return expression
        },
        ''
      )
      const expressionAttributeNames = Object.keys(payload).reduce(
        (attributeNames, key) => {
          return { ...attributeNames, [`#${key}`]: key }
        },
        {}
      )
      const expressionAttributeValues = Object.keys(payload).reduce(
        (attributeValues, key) => {
          return { ...attributeValues, [`:${key}`]: payload[key] }
        },
        {}
      )

      const parameters = {
        TableName: tableName,
        Key: { id },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ConditionExpression: 'attribute_exists(id)',
        ReturnValues: 'ALL_NEW',
      }
      return awsDocumentClient.update(parameters).promise()
    },
    deleteById: id => {
      const parameters = {
        TableName: tableName,
        Key: { id },
        ReturnValues: 'ALL_OLD',
      }
      return awsDocumentClient.delete(parameters).promise()
    },
    getById: id => {
      const parameters = {
        TableName: tableName,
        Key: { id },
      }
      return awsDocumentClient.get(parameters).promise()
    },
    batchGetByAttributes: attributes => {
      const keys = Object.keys(attributes).map(key => ({
        [key]: attributes[key],
      }))
      const parameters = { RequestItems: { [tableName]: { Keys: keys } } }

      return awsDocumentClient.batchGet(parameters).promise()
    },
    queryByAttributes: ({
      indexName,
      attributes,
      limit,
      exclusiveStartKey,
    }) => {
      const keyConditionExpression = Object.keys(attributes).reduce(
        (expression, key) => {
          const keyExpression = `#${key} = :${key}`
          if (!expression) return keyExpression
          return expression + ` and ${keyExpression}`
        },
        ''
      )
      const expressionAttributeNames = Object.keys(attributes).reduce(
        (attributeNames, key) => {
          return { ...attributeNames, [`#${key}`]: key }
        },
        {}
      )
      const expressionAttributeValues = Object.keys(attributes).reduce(
        (attributeValues, key) => {
          return { ...attributeValues, [`:${key}`]: attributes[key] }
        },
        {}
      )

      const parameters = {
        TableName: tableName,
        IndexName: indexName,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ...(limit && { Limit: limit }),
        ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey }),
      }

      return awsDocumentClient.query(parameters).promise()
    },
    scanByAttributes: attributes => {
      const filterExpression = Object.keys(attributes).reduce(
        (expression, key) => {
          const keyExpression = `#${key} = :${key}`
          if (!expression) return keyExpression
          return expression + ` and ${keyExpression}`
        },
        ''
      )
      const expressionAttributeNames = Object.keys(attributes).reduce(
        (attributeNames, key) => {
          return { ...attributeNames, [`#${key}`]: key }
        },
        {}
      )
      const expressionAttributeValues = Object.keys(attributes).reduce(
        (attributeValues, key) => {
          return { ...attributeValues, [`:${key}`]: attributes[key] }
        },
        {}
      )

      const parameters = {
        TableName: tableName,
        FilterExpression: filterExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
      }

      return awsDocumentClient.scan(parameters).promise()
    },
  }
}

module.exports = { configure }
