# Testing

We currently use Redocly's tooling to test that our api is following the specification. We also use it to verify that we can generate, submit, and receive responses that match our api description with Redocly's "Try It" feature that let's you send requests directly from the auto-generated docs.

1.  Install `redocly cli` - https://redocly.com/docs/cli/installation/
2.  Run `redocly lint json_api.yaml` (Docs on their lint command: https://redocly.com/docs/cli/commands/lint/)

    - Resolve any errors that appear by looking up error codes here: https://redocly.com/docs/cli/rules/recommended/

3.  Log in if you have Redocly credentials to use the premium version (the community version also works, but does not have the ["Try It"](https://redocly.com/docs/api-reference-docs/guides/try-it-console/) feature)

    - To Log in run `redocly login` (then follow the instructions)

4.  Run `redocly preview-docs json_api.yaml` - https://redocly.com/docs/cli/commands/preview-docs/
5.  In order to use the "Try it!" feature to see if the specification can be used to send a valid request and correctly validate a real response, you'll need to get around CORS errors. One way to do that is to run this script to create an unprotected Chrome, then view your generated docs from there: `open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security`

# Plan & Actions

We targets toward the end of November 2024 to have a first version available, not necessarily encompassing all the below tasks.

## Proposal

- [ ] Obtain sign-off for this proposal from stakeholders representing each area
  - [ ] rippled
  - [ ] clio
  - [ ] xrpl-js
  - [ ] xrpl-py
  - [ ] xrpl.org
  - [ ] xrpl4j
- [ ] Notify and request feedback from additional projects
  - [ ] xrpl-go
  - [ ] xrpl-php
  - [ ] xrpl-rust

## Shared Spec Work

- [ ] Decide on servers urls, should this list contain non-ripple servers? All UNL `ws_urls`? Just public infrastructure?
- [ ] Publishing specs to dependent package managers starting with npm, PyPi, and Conan
- [ ] Add automated linting CI/CD to API repo
- [ ] Rearrange and simplify docs in shared spec repo

## OpenAPI Spec

### OpenAPI Docs Work

- [ ] Handle amendment: use `externalDocs` with description and link toward the Explorer to show active status.
- [ ] Generate sample requests for exercising major features of `rippled` and `clio` and include them in the spec itself
  - [ ] All error conditions
    - [ ] Samples of different types of validation errors
  - [ ] Including things that require multiple things to happen, such as meeting reserve
  - [ ] Samples of successful transactions
- [ ] Add remaining methods
- [ ] Add remaining transactions
- [ ] Capture all HTTP error codes in the spec

### OpenAPI Tooling Work

- [ ] Fix CORS errors with Redocly “Try it” feature

### AsyncAPI Spec

AsyncAPI Docs Work

- [ ] Handle amendment: use `externalDocs` with description and link toward the Explorer to show active status.
- [ ] Add remaining methods
- [ ] Add remaining transactions
- [ ] Consolidation of API fields id and type into BaseSuccess and BaseError for maintainability and readability
- [ ] Consolidate request bodies with OpenAPI for more reuse

### AsyncAPI Tooling Work

- [ ] Redocly support for AsyncAPI 3.0

## rippled

- [ ] Code generation prototype
  - [ ] Code stubs for handlers
  - [ ] Integration with Request Handler
    - [ ] Runtime request verification
  - [ ] (TBD) Wiring up existing code execution handlers
- [ ] Integrate generated code with existing codebase, starting with v3 API
- [ ] Address any concerns about binary bloat from maintaining hand-crafted v1 and v2 along with auto-generated v3 and v4
- [ ] Add a PR checklist item to update this spec as a stop gap to long-term automated code generation that will bring compile time spec verification, integration tests, and changes to the request handler

## Clio

- [ ] Code generation prototype
  - [ ] Code stubs for handlers
  - [ ] Integration with Request Handler
    - [ ] Runtime request verification
  - [ ] (TBD) Wiring up existing code execution handlers
- [ ] Integrate generated code with existing codebase, starting with v3 API
- [ ] Address any concerns about binary bloat from maintaining hand-crafted v1 and v2 along with auto-generated v3 and v4
- [ ] Add a PR checklist item to update this spec as a stop gap to long-term automated code generation that will bring compile time spec verification, integration tests, and changes to the request handler

## xrpl-js

- [ ] Code generation prototype
- [ ] Integrate generated code with existing codebase, starting with v3 API

## xrpl-py

- [ ] Code generation prototype
- [ ] Integrate generated code with existing codebase, starting with v3 API

## xrpl.org

- [ ] Translate existing docs into the OpenAPI/AsyncAPI specs, particularly description and example fields
- [ ] Upgrade XRPL AI to include AI function calling that allows the bot to execute commands automatically against the XRPL simply by reading the API specification
- [ ] Integrate OpenAPI and AsyncAPI into Redocly, including styling

# Future work

- [ ] Publish specs to other package managers such as Cargo (for Rust)
- [ ] Work with https://xrplcluster.com to see about integration

## Moving to OpenAPI 4.0 due to limitation of OpenAPI 3.0 mapping input parameters to exact output response objects

The `discriminator` property on input parameters can map input parameters to input schemas, but it does not do the same for mapping input parameters to response schema.

```
paths:
  /:
    post:
      requestBody:
        content:
          application/json:
            schema:
              discriminator:
                propertyName: method
                mapping:
                  account_channels: '#/components/schemas/AccountChannelsRequest'
                  account_info: '#/components/schemas/AccountInfoRequest'
              oneOf:
                - $ref: '#/components/schemas/AccountChannelsRequest'
                - $ref: '#/components/schemas/AccountInfoRequest'
      responses:
        '200':
          content:
            application/json:
              schema:
                discriminator:
                  propertyName: method
                  mapping:
                    account_channels: '#/components/schemas/AccountChannelsResponse'
                    account_info: '#/components/schemas/AccountInfoResponse'
                oneOf:
                  - $ref: '#/components/schemas/AccountChannelsResponse'
                  - $ref: '#/components/schemas/AccountInfoResponse'
```

- The `discriminator` uses the method property to differentiate between `AccountChannelsRequest` and `AccountInfoRequest`.
- The responses can be `AccountChannelsResponse` or `AccountInfoResponse`.
- OpenAPI cannot enforce that `AccountChannelsRequest` maps strictly to `AccountChannelsResponse` and `AccountInfoRequest` to `AccountInfoResponse` based on the discriminator. OpenAPI 4.0 will address this issue by allowing different responses based on query parameters, headers, and request bodies.
