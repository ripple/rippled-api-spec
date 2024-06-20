# How to add a new `rippled` API version specs

For these instructions:

- Fill in the request name in `<request_name>`
- Fill in the version number in `<version>`

## OpenAPI specific steps for adding a new `rippled` API version specs

- Please note that this instruction assumes that the `rippled` JSON_RPC format does not change between versions and that to make a JSON-RPC request, one sends an HTTP POST request to the root path (/) on the port and IP where the rippled server is listening for JSON-RPC connections. If there is a major change in this behavior in latter versions, please see the [OpenAPI](https://www.openapis.org/) documentation and [rippled release notes](https://github.com/XRPLF/rippled/releases) to create a new version.

1. Create a new file in `open_api/` folder named `json_api_v<version>`
2. Copy and paste the existing `json_api` file in this same folder to reuse the same structure.
3. Revise the list of requests inside the discriminator to make sure the list aligns with the available methods for that specific version.

```
discriminator:
  propertyName: method
  mapping:
    account_channels: 'requests/account_channels_open_api.yaml#/components/schemas/AccountChannelsRequest'
    account_info: 'requests/account_info_open_api.yaml#/components/schemas/AccountInfoRequest'
    ...More request types here...
oneOf:
  - $ref: 'requests/account_channels_open_api.yaml#/components/schemas/AccountChannelsRequest'
  - $ref: 'requests/account_info_open_api.yaml#/components/schemas/AccountInfoRequest'
  ...More request types here...
```

4. Revise the list of responses inside the `200` success group to make sure the list aligns with the available methods for that specific version.

```
'200':
          description: JSON-RPC response object
          content:
            application/json:
              schema:
                oneOf:
                  - $ref: 'requests/account_channels_open_api.yaml#/components/schemas/AccountChannelsResponse'
                  - $ref: 'requests/account_info_open_api.yaml#/components/schemas/AccountInfoResponseV1'
                  ...More response types here...
```

5. Make changes to specific requests that has changed since this version of the API [following these steps here](#add-a-new-request-that-has-changed-with-the-new-version-of-the-api).

## AsyncAPI specific steps for adding a new `rippled` API version specs

1. Create a new file in `async_api/` folder named `websocket_api_v<version>`
2. Copy and paste the existing `websocket_api` files in this same folder to reuse the same structure.
3. Revise the list of requests inside `subscibe` and `publish` lists to make sure the lists align with the available methods for that specific version.

```
subscribe:
      message:
        oneOf:
          - messageId: 'AccountChannelsRequest'
            payload:
              $ref: './requests/account_channels_async_api.yaml#/components/schemas/AccountChannelsRequest'
          - messageId: 'AccountInfoRequest'
            payload:
              $ref: './requests/account_info_async_api.yaml#/components/schemas/AccountInfoRequest'
          ...More request types here...

    publish:
      message:
        oneOf:
          - messageId: 'AccountChannelsResponse'
            payload:
              $ref: './requests/account_channels_async_api.yaml#/components/schemas/AccountChannelsResponse'
          - messageId: 'AccountInfoResponse'
            payload:
              $ref: './requests/account_info_async_api.yaml#/components/schemas/AccountInfoResponseV1'
          ...More response types here...
```

4. Make changes to specific requeststhat has changed since this version of the API [following these steps here](./add-a-new-rippled-api-version.md#add-a-new-request-that-has-changed-with-the-new-version-of-the-api).

## Add a new request that has changed with the new version of the API

- Please note that the below instructions will only pertain to successful requests. Error responses will be handled almost the same way.

1. Add a base type of the request (if not already) that contains common fields among all versions in `shared\requests\<request_name>.yaml` (e.g. `shared\requests\account_info.yaml`).

```
    <request_name>ResponseBase:
      allOf:
        - $ref: '../base.yaml#/components/schemas/BaseSuccessResponse'
        - type: object
          properties:
            ...Add all common properties here...
```

For example,

```
AccountInfoSuccessResponseBase:
      allOf:
        - $ref: '../base.yaml#/components/schemas/BaseSuccessResponse'
        - type: object
          properties:
            account_flags:
              $ref: '#/components/schemas/AccountFlags'
              description: The account's flag statuses.
            ... More common fields here ...
```

2. Create different versions of the request that inherit from the base request, along with their distinct properties.

```
<request_name>SuccessResponseV<version>:
  allOf:
    - $ref: '#/components/schemas/<request_name>SuccessResponseBase'
    - type: object
      properties:
        ...Add unique properties here...
```

For example,

```
AccountInfoSuccessResponseV2:
  allOf:
    - $ref: '#/components/schemas/AccountInfoSuccessResponseBase'
    - type: object
      properties:
        signer_lists:
          type: array
          description: Array of SignerList ledger objects associated with this account for Multi-Signing.
          items:
            $ref: '#/components/schemas/SignerList'
        ...More unique properties here...
```
