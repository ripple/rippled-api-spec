# rippled-api-spec

A repository for OpenAPI / AsyncAPI specifications. This ideally eventually can be used to automatically generate code and docs to simplify supporting rippled changes over time.

This will eventually contain specifications for rippled's JSON RPC API and Websocket API.

These apis will aim to eventually include all requests for both `rippled` and `clio`, supporting both v1 and v2 rippled api interfaces.

The JSON RPC API will be written out using [OpenAPI](https://www.openapis.org/) as it has a more direct request / response format.
The Websocket API will be written using [AsyncAPI] which better matches the ways in which the Websocket interface can asynchronously call back with things like `stream`.

# Testing

We currently use Redocly's tooling to test that our api is following the specification. We also use it to verify that we can generate, submit, and receive responses that match our api description with Redocly's "Try It" feature that let's you send requests directly from the auto-generated docs.

1.  Install `redocly cli` - https://redocly.com/docs/cli/installation/
2.  Run `redocly lint json_api.yaml` (Docs on their lint command: https://redocly.com/docs/cli/commands/lint/)

    - Resolve any errors that appear by looking up error codes here: https://redocly.com/docs/cli/rules/recommended/

3.  Log in if you have Redocly credentials to use the premium version (the community version also works, but does not have the ["Try It"](https://redocly.com/docs/api-reference-docs/guides/try-it-console/) feature)

    - To Log in run `redocly login` (then follow the instructions)

4.  Run `redocly preview-docs json_api.yaml` - https://redocly.com/docs/cli/commands/preview-docs/

# How to add a new request

For these instructions:

- "..." indicates you should edit something (Ex. Replacing `...Request` with `AccountChannelsRequest`)
- If this is for a request documented on xrpl.org, please copy and paste the documentation from there.
- Read through `shared/base.yaml` after doing a draft of your spec to see if there are any re-usable components that make sense for your requests/responses
- These instructions start with the "shared" schemas between OpenAPI and AsyncAPI, then links to the specific steps to do AFTER. Adding a request to either requires doing this shared work first!

1.  _If you've already created a spec in the shared folder for this request, skip to the OpenAPI specific steps!_
2.  Create a new file for the rippled request / response information in `shared/requests/<request_name.yaml>`

    - Ex. [`shared/requests/account_channels.yaml`](/shared/requests/account_channels.yaml)

3.  In that shared file, add the `Request` type.

    1.  "..." indicates you should edit something (Ex. Replacing `...Request` with `AccountChannelsRequest`)
    2.  If this is for a request documented on xrpl.org, please copy and paste the documentation from there.
    3.  Read through `shared/base.yaml` to see if there are any re-usable components that make sense for your request

    - Ex.

    ```
    ...Request:
      summary: >
        "..."
      type: object
      # TODO: Add any common fields from `shared/base.yaml` that are applicable using `allOf`. Otherwise delete these comments! For example:
      # allOf:
      #  - $ref: '../base.yaml#/components/schemas/LookupByLedgerRequest'
      #  - ...
      properties:
        # Example property
        # account:
          # type: string
          # description: The unique identifier of an account, typically the account's address.
        ...
      required:
        - ...
    ```

4.  Create the `...SuccessResponse` schema for when `rippled` responds with `success`

    - Ex.

    ```
    ...SuccessResponse:
      # TODO: Add any common fields from `shared/base.yaml` that are applicable using `allOf`. Otherwise delete these comments! For example:
      # allOf:
      #  - $ref: '../base.yaml#/components/schemas/LookupByLedgerRequest'
      #  - ...
      type: object
      properties:
        # Example property
        # account:
          # type: string
          # description: The unique identifier of an account, typically the account's address.
        ...
      required:
        - ...
    ```

5.  Create the `...ErrorResponse` schema for when `rippled` responds with an error code

    - Ex.

    ```
    ...ErrorResponse:
      type: object
      properties:
        error:
          type: string
          oneOf:
            - $ref: '../base.yaml#/components/schemas/UniversalErrorResponseCodes'
            # Add the error codes specific to this response here (ex. invalidParams)
            - enum:
                - ...
          description: >
            # Describe each error code in bullet form here. Ex. "* `invalidParams` - One or more fields are specified incorrectly, or one or more required fields are missing."
            ...
        status:
          type: string
          enum:
            - error
        request:
          # This should link to the ...Request type you defined above
          $ref: ...
      required:
        - status
        - error
        - request
    ```

6.  If you want to add a request to the OpenAPI spec, [follow these steps here](#openapi-specific-steps-for-adding-a-new-request) (otherwise skip this step)
7.  If you want to add a request to the AsyncAPI spec, [follow these steps here](#asyncapi-specific-steps-for-adding-a-new-request) (otherwise skip this step)

## OpenAPI-specific steps for adding a new request

_This section assumes you've already completed the shared work steps for this request in [How to add a new request](#how-to-add-a-new-request)_

Although most of the body will re-use the shared schemas we defined earlier, we need boilerplate to fit the OpenAPI formatting and specify this new request/response as a valid rippled input/output.

1. Create a new file in `open_api/requests` named `..._open_api.yaml` for your new request. Ex. `account_channels_open_api.yaml`

   - The reason to include `_open_api` in the name is to make it easier to tell which file we're referencing throughout the codebase, and to make filename searches less confusing when debugging. Including it at the end also makes it easier to at a glance find the right file in the explorer.

2. Create

Note: If you want to also add this request to the AsyncAPI, continue by [following these steps here](#asyncapi-specific-steps-for-adding-a-new-request)

## AsyncAPI-specific steps for adding a new request

_This section assumes you've already completed the shared work steps for this request in [How to add a new request](#how-to-add-a-new-request)_

1.

Note: If you want to also add this request to the OpenAPI spec _and haven't already_, continue by [following these steps here](#asyncapi-specific-steps-for-adding-a-new-request)

# OpenAPI (used for rippled's JSON API)

_If you're new to OpenAPI, you should read through [this tutorial](https://learn.openapis.org/specification/) and use [these reference docs](https://spec.openapis.org/oas/v3.1.0) to look up any terms you see that are unfamiliar_

## Preferences

In situations where there are multiple equivalent ways to write this spec, this outlines the choices we’ve made that we want to keep consistent. If we update these, please update them for ALL entries in ALL specs for consistency’s sake.

1.  `required` is specified at the bottom of request / response schemas by listing required fields - NOT specified in every individual field. (This makes it easier to at-a-glance see if the list of required fields are all there / what they are, but makes it slightly harder to read individual fields and know if they’re required or not).
2.  In order to specify the request / response type for JSON RPC, we need to use a generic path (`/`) and a [`discriminator`](https://redocly.com/docs/resources/discriminator/) which allows us to derive the “type” of an object from the value in a specific parameter in the request. (In the case of the JSON RPC API, the `method` field tells us the type of request, which corresponds exactly with 1 or 2 response types)
    - The one case where this isn’t enough information is when a request has a `binary` option - in which case there are 2 possible response structures.
3.  Error responses in the "path" section represent HTTP response / errors. `rippled` or `clio` errors are treated as valid responses, and should be documented as `oneOf` the possible representations for each individual request response. Although rippled errors share a similar shape, ultimately we want to be very clear on what the specific error codes that are possible from each request.

## How to add a new Request

# AsyncAPI (used for rippled's Websocket API)

_If you're new to **AsyncAPI**, you should read through [this 2.6.0 tutorial](https://v2.asyncapi.com/docs/tutorials/getting-started) and use [these 2.6.0 reference docs](https://v2.asyncapi.com/docs/reference/specification/v2.6.0) to look up any terms you see that are unfamiliar_

# Things to investigate

1. We'll need to fix the CORS error for the Redocly "Try it" feature when we deploy on xrpl.org. That should be a server setting.
1. We'll need to talk to Redocly about getting them to support "Try it" for AsyncAPI specs (should be similar code).
1. It's unclear the best way to set up the primary api file (websocket_api.yaml and json_api.yaml) to pair specific input parameters to a specific response. As it is now, both api descriptions have a list of possible parameters for each `rippled` request, but it's defined as two lists rather than a list of input/output pairs. One idea for how to solve this is maybe we can define multiple `post` requests
1. Should we use AsyncAPI 2.6.0 (currently partially supported by Redocly) or use AsyncAPI 3.0.0 (cleaner interface & resolves input / output pairing problem)

1. Currently, the way we test the spec is through including examples which we can validate against rippled using the "Try It" feature in Redocly previews. That's not a robust way to test all possible inputs / outputs of rippled requests. Some enhancements we can consider for this long-term:

   1. Having examples which reproduce every error case for a specific request
   2. Verifying that we have unit tests for every possible error code in our test suite

1. Note on the formatting of this README - for some reason prettier formats code blocks with one-space indents instead of 2 (in the yaml file 2 space indents are used). This makes the examples slightly harder to copy and paste, although they should work. Would be nice to fix that.
