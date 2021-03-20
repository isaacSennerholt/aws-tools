const yup = require('yup')
const { v4: uuidv4 } = require('uuid')
const dynamoDbSdk = require('@mrp-aws/dynamo-db-sdk')

const defaultShape = {
  id: yup.string().required(),
  updatedAt: yup.string().required(),
  createdAt: yup.string().required(),
}

function _reduceShapeToMatchPayload(originShape = {}, payload = {}) {
  return Object.keys(payload).reduce((reducedShape, payloadKey) => {
    if (!payload[payloadKey] || !originShape[payloadKey]) return reducedShape
    return { ...reducedShape, [payloadKey]: originShape[payloadKey] }
  }, {})
}

function define({ tableName, shape, region, endpoint }) {
  const dynamoDb = dynamoDbSdk.configure({ tableName, region, endpoint })
  const shapeWithDefaults = { ...shape, ...defaultShape }
  return {
    getById: async id => {
      const { Item } = await dynamoDb.getById(id)
      return Item || null
    },
    batchGetByAttributes: async attributes => {
      const { Responses } = await dynamoDb.batchGetByAttributes(attributes)
      return Responses[tableName]
    },
    queryByAttributes: async (indexName, attributes) => {
      const { Items } = await dynamoDb.queryByAttributes(indexName, attributes)
      return Items
    },
    scanByAttributes: async (attributes) => {
      const { Items } = await dynamoDb.scanByAttributes(attributes)
      return Items
    },
    create: async payload => {
      const schema = yup.object(shapeWithDefaults).noUnknown(true)
      const payloadWithDefaults = {
        ...payload,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await schema.validate(payloadWithDefaults, { strict: true })
      return dynamoDb.create(payloadWithDefaults)
    },
    updateById: async (id, payload) => {
      const payloadWithDefaults = { ...payload, updatedAt: new Date().toISOString() }
      const shapeFromPayload = _reduceShapeToMatchPayload(
        shapeWithDefaults,
        payloadWithDefaults
      )

      const shapeToUse = Object.keys(shapeFromPayload).length
        ? shapeFromPayload
        : shapeWithDefaults

      const schema = yup.object(shapeToUse).noUnknown(true)

      await schema.validate(payloadWithDefaults, { strict: true })
      const { Attributes } = await dynamoDb.updateById(id, payloadWithDefaults)
      return Attributes || null
    },
    deleteById: async id => {
      const { Attributes } = await dynamoDb.deleteById(id)
      return Attributes || null
    },
  }
}

module.exports = { define }
