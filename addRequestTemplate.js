const fs = require('fs')
const YAML = require('yaml')

if (process.argv.length !== 3) {
  console.error('Usage: node addRequestTemplate.js <input>')
  process.exit(1)
}

const input = process.argv[2]

const camelCaseInput = input.split('_').map((word, index) => {
  if (index === 0) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  } else {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
}).join('')

const openAPISpecs = YAML.stringify(
  {
    components: {
      schemas: {
        [`${camelCaseInput}Request`]: {
          type: 'object',
          description: ``,
          properties: {
            method: {
              type: 'string',
              enum: [input],
            },
            params: {
              type: 'array',
              items: {
                $ref: `../../shared/requests/${input}.yaml#/components/schemas/${camelCaseInput}Request`,
              },
            },
          },
          required: ['method'],
          example: {
            method: input,
            params: [],
          },
        },
        [`${camelCaseInput}Response`]: {
          type: 'object',
          properties: {
            result: {
              type: 'object',
              discriminator: {
                propertyName: 'status',
                mapping: {
                  success: `../../shared/requests/${input}.yaml#/components/schemas/${camelCaseInput}SuccessResponse`,
                  error: `../../shared/requests/${input}.yaml#/components/schemas/${camelCaseInput}ErrorResponse`,
                },
              },
              oneOf: [
                { $ref: `../../shared/requests/${input}.yaml#/components/schemas/${camelCaseInput}SuccessResponse` },
                { $ref: `../../shared/requests/${input}.yaml#/components/schemas/${camelCaseInput}ErrorResponse` },
              ],
            },
          },
          required: ['result'],
          example: {
            result: {
            },
          },
        },
        [`${camelCaseInput}SuccessResponse`]: {
          type: 'object',
          allOf: [
            { $ref: '../../shared/base.yaml#/components/schemas/BaseSuccessResponse' },
            { $ref: `../../shared/requests/${input}.yaml#/components/schemas/${camelCaseInput}SuccessResponse` },
          ],
        },
      },
    },
  }
)

const asyncAPISpecs = YAML.stringify( 
  {
    components: {
      schemas: {
        [`${camelCaseInput}Request`]: {
          description: '',
          type: 'object',
          allOf: [
            { $ref: `../../shared/requests/${input}.yaml#/components/schemas/${camelCaseInput}Request` }
          ],
          properties: {
            command: {
              type: 'string',
              enum: [input],
            },
            id: {
              description: 'A unique identifier for the request.',
            },
          },
          required: ['command', 'id'],
          example: {},
        },
        [`${camelCaseInput}Response`]: {
          type: 'object',
          properties: {
            result: {
              type: 'object',
              discriminator: {
                propertyName: 'status',
                mapping: {
                  success: `../../shared/requests/${input}.yaml#/components/schemas/${camelCaseInput}SuccessResponse`,
                  error: `#/components/schemas/${camelCaseInput}ErrorResponse`,
                },
              },
              oneOf: [
                { $ref: `../../shared/requests/${input}.yaml#/components/schemas/${camelCaseInput}SuccessResponse` },
                { $ref: `#/components/schemas/${camelCaseInput}ErrorResponse` },
              ],
            },
            id: {
              description: 'A unique identifier for the request.',
            },
            type: {
              type: 'string',
              description: 'The value response indicates a direct response to an API request. Asynchronous notifications use a different value such as `ledgerClosed` or `transaction`.',
              enum: ['response'],
            },
          },
          required: ['id', 'type'],
          example: {},
        },
        [`${camelCaseInput}ErrorResponse`]: {
          oneOf: [
            { $ref: '../../shared/base.yaml#/components/schemas/WebsocketErrorFields' },
            { $ref: `../../shared/requests/${input}.yaml#/components/schemas/${camelCaseInput}ErrorResponse` },
          ],
        },
      },
    },
  }
)

sharedRequestSpecs = YAML.stringify(
  {
    components: {
      schemas: {
        [`${camelCaseInput}Request`]: {
          description: '',
          type:'object',
          properties: {},
        },
        [`${camelCaseInput}SuccessResponse`]: {
          description: '',
          type:'object',
          properties: {},
        },
        [`${camelCaseInput}ErrorResponse`]: {
          description: '',
          type:'object',
          properties: {},
        },
      },
    },
  }
)

fs.writeFileSync(`async_api/requests/${input}_async_api.yaml`, asyncAPISpecs, 'utf8')
fs.writeFileSync(`open_api/requests/${input}_open_api.yaml`, openAPISpecs, 'utf8')
fs.writeFileSync(`shared/requests/${input}.yaml`, sharedRequestSpecs, 'utf8')

console.log(`OpenAPI specs generated for ${input} method.`)