# Handle different `rippled` API versions.

Date: 2024-04-24

Status: proposed

## Context

The `rippled` server employs a single integer to identify the API version in use. Presently, there are two API versions: 1 and 2. It is imperative to distinguish between major versions of the API to facilitate other repositories (such as the documentation site, Clio, etc.) in appropriately adapting their API usage over time.

## Proposed Design

The proposed design suggests utilizing separate specifications for different versions of the API (e.g., `json_api_v1` vs `json_api_v2`). Within each specification, the version parameter inside the info section would indicate the version number. For methods exhibiting variations across different versions, method mapping would point to the specific version. Version separation would extend to the method level as well, accommodating multiple versions of the same method. This could be achieved through inheritance and polymorphism (e.g., `AccountInfoSuccessResponseV1` and `AccountInfoSuccessResponseV2`, both extending `AccountInfoResponseBase`).

## Implementation Examples

[open_api/json_api_v2.yaml](/open_api/json_api_v2.yaml)

```
openapi: 3.1.0
info:
  title: XRP Ledger Public API
  description: A JSON RPC API used to query rippled.
  license:
    name: MIT License
    identifier: mit
    url: https://opensource.org/license/mit/
  version: 2.0.0
...
      responses:
        '200':
          description: JSON-RPC response object
          content:
            application/json:
              schema:
                # TODO: Map the input request types to these output responses.
                # They do not have a consistent field which is available on all of them which tells you which request was sent.
                # Errors have `result.request.method`, but success responses
                oneOf:
                  - $ref: 'requests/account_channels_open_api.yaml#/components/schemas/AccountChannelsResponse'
                  - $ref: 'requests/submit_open_api.yaml#/components/schemas/AccountInfoResponseV2'
...

```

[open_api/requests/account_info_open_api.yaml](/open_api/requests/account_info_open_api.yaml)

```
AccountInfoResponseV1:
  type: object
  properties:
    result:
      type: object
      discriminator:
        propertyName: status
        mapping:
          success: '../../shared/requests/account_info.yaml#/components/schemas/AccountInfoSuccessResponseV1'
          error: '../../shared/requests/account_info.yaml#/components/schemas/AccountInfoErrorResponse'
      oneOf:
        - $ref: '../../shared/requests/account_info.yaml#/components/schemas/AccountInfoSuccessResponseV1'
        - $ref: '../../shared/requests/account_info.yaml#/components/schemas/AccountInfoErrorResponse'
...

AccountInfoResponseV2:
  type: object
  properties:
    result:
      type: object
      discriminator:
        propertyName: status
        mapping:
          success: '../../shared/requests/account_info.yaml#/components/schemas/AccountInfoSuccessResponseV2'
          error: '../../shared/requests/account_info.yaml#/components/schemas/AccountInfoErrorResponse'
      oneOf:
        - $ref: '../../shared/requests/account_info.yaml#/components/schemas/AccountInfoSuccessResponseV2'
        - $ref: '../../shared/requests/account_info.yaml#/components/schemas/AccountInfoErrorResponse'
...
```

[shared/requests/account_info.yaml](/shared/requests/account_info.yaml)

```
AccountInfoSuccessResponseBase:
      allOf:
        - $ref: '../base.yaml#/components/schemas/BaseSuccessResponse'
        - type: object
          properties:
            account_flags:
              $ref: '#/components/schemas/AccountFlags'
              description: The account's flag statuses.
...

AccountInfoSuccessResponseV1:
  allOf:
    - $ref: '#/components/schemas/AccountInfoSuccessResponseBase'
    - type: object
      properties:
        account_data:
          $ref: '#/components/schemas/AccountRootWithSignerLists'
          description: The AccountRoot ledger object with this account's information, including signer lists, as stored in the ledger.

AccountInfoSuccessResponseV2:
  allOf:
    - $ref: '#/components/schemas/AccountInfoSuccessResponseBase'
    - type: object
      properties:
        account_data:
          $ref: '#/components/schemas/AccountRoot'
          description: The AccountRoot ledger object with this account's information, as stored in the ledger.
        signer_lists:
          type: array
          description: Array of SignerList ledger objects associated with this account for Multi-Signing.
          items:
            $ref: '#/components/schemas/SignerList'
...
```

## Considerations

An alternative option was considered, which involves using one combined specification for all versions with a discriminator on the `api_version` field of the request. However, this approach presents several potential issues:

- Since `api_version` is nested inside params instead of being on the outer level, implementing the discriminator would be complex.
- Combining different versions would necessitate more nested allOf and oneOf, increasing complexity and making the spec harder to comprehend, which is also not fully supported by OpenAPI or Redocly.
- Separation into multiple specifications would facilitate easier maintenance of each version.
- If there's a major change in the API structure in a new version, this approach might not be feasible. For instance, if `rippled` decides to use multiple endpoints instead of just the root `/`.

Additionally, there might arise a need to support minor versions of `rippled`, but this would require further discussion.
