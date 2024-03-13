# rippled-api-spec

A repository for OpenAPI / AsyncAPI specifications. This ideally eventually can be used to automatically generate code and docs to simplify supporting rippled changes over time.

This will eventually contain specifications for rippled's JSON RPC API and Websocket API.

These apis will aim to eventually include all requests for both `rippled` and `clio`, supporting both v1 and v2 rippled api interfaces.

The JSON RPC API will be written out using [OpenAPI](https://www.openapis.org/) as it has a more direct request / response format.
The Websocket API will be written using [AsyncAPI] which better matches the ways in which the Websocket interface can asynchronously call back with things like `stream`.

_If you're new to **OpenAPI**, you should read through [this tutorial](https://learn.openapis.org/specification/) and use [these reference docs](https://spec.openapis.org/oas/v3.1.0) to look up any terms you see that are unfamiliar_

_If you're new to **AsyncAPI**, you should read through [this 2.6.0 tutorial](https://v2.asyncapi.com/docs/tutorials/getting-started) and use [these 2.6.0 reference docs](https://v2.asyncapi.com/docs/reference/specification/v2.6.0) to look up any terms you see that are unfamiliar_

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

- There's a decent amount of boilerplate code, so each step will include a template you should copy along with a list of which fields need updating.
- `...` in the template indicates you should edit something (Ex. Replacing `...Request` with `AccountChannelsRequest`)
- If this is for a request documented on xrpl.org, please copy and paste the documentation from there.
- Read through `shared/base.yaml` after doing a draft of your spec to see if there are any re-usable components that make sense for your requests/responses

1.  _If you've already created a spec in the shared folder for this request, skip to the OpenAPI specific steps!_
2.  Create a new file for the rippled request / response information in `shared/requests/<request_name.yaml>`

    - For example: [`shared/requests/account_channels.yaml`](/shared/requests/account_channels.yaml)

3.  In that shared file, add the `Request` type.

    1.  `...` indicates you should edit something (Ex. Replacing `...Request` with `AccountChannelsRequest`)
    2.  If this is for a request documented on xrpl.org, please copy and paste the documentation from there.
    3.  Read through `shared/base.yaml` to see if there are any re-usable components that make sense for your request

    - Fields to update:
      1. `...Request` with the name of the request (ex. `AccountChannelsRequest`)
      2. `summary:` with a description of this request
      3. If there are any common fields in `shared/base.yaml` that can be re-used, do so with `allOf` - otherwise delete that TODO comment.
      4. `properties` with the parameters for this request (in alphabetical order)
      5. `required` with a list of any required parameters (in alphabetical order)

    ```
    ...Request:
      summary: >
        ...
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

4.  Create the `...SuccessResponse` schema for when `rippled` responds with `success`.

    - Fields to update:
      1. `...SuccessResponse` with the name of the request (ex. `AccountChannelsSuccessResponse`)
      2. If there are any common fields in `shared/base.yaml` that can be re-used, do so with `allOf` - otherwise delete that TODO comment.
      3. `properties` with the parameters for this request (in alphabetical order)
      4. `required` with a list of any required parameters (in alphabetical order)

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

5.  Create the `...ErrorResponse` schema for when `rippled` responds with an error code.

    - Fields to update:
      1. `...ErrorResponse` with the name of the request (ex. `AccountChannelsErrorResponse`)
      2. `enum:` with a yaml list of the specific error codes that are associated with this specific response (ex. invalidParams). Do not include errors which are already in the `UniversalErrorResponseCodes` listed in `shared/base.yaml`.
      3. `request` should have a reference to the **shared** `...Request`. (**NOT** the `...Request` object that is in this file!)

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
          # Include a bullet descrip for every
          description: >
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

At a high level, we're going to wrap the core types we defined in `shared/` in boilerplate so it matches the JSON RPC formatting `rippled` expects / produces, then we're going to reference our wrapped types in the core `json_api.yaml` file.

1. Create a new file in `open_api/requests` named `..._open_api.yaml` for your new request. Ex. `account_channels_open_api.yaml`

   - The reason to include `_open_api` in the name is to make it easier to tell which file we're referencing throughout the codebase, and to make filename searches less confusing when debugging. Including it at the end also makes it easier to at a glance find the right file in the explorer.
   - Example file: [open_api/requests/account_channels_open_api.yaml](./open_api/requests/account_channels_open_api.yaml)

2. Add a `...Request` schema with the following boilerplate and an example which references the `...Request` we defined in `shared/requests`. See template below:

   - Fields to update:
     1. `...Request` with the name of the request (Ex. `AccountChannelRequest`)
     2. `description` with a long explanation of what the request is (use xrpl.org text if available)
     3. `method` with the request name (ex. `account_channels`)
     4. `items`'s `$ref:` to reference the `...Request`we defined in `shared/requests`
     5. `example` with a valid request of this type that includes most if as many optional fields as possible while still being valid

   ```
    ...Request:
      type: object
      description: >
        ...
      properties:
        method:
          type: string
          enum: # This is the most supported way to define a specific string as the only valid input. `const` is a new keyword which is supported in OpenAPI, but not in all corresponding codegen tools. https://github.com/OAI/OpenAPI-Specification/issues/1313
            - ...
        params:
          type: array
          items:
            $ref: # Reference the shared `...Request` schema
      required:
        - method
      example:
        # Provide a valid example here, such as:
        # method: 'account_channels'
        # params:
        #   - account: 'rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn'
        #     destination_account: 'ra5nK24KXen9AHvsdFTKHSANinZseWnPcX'
        #     ledger_index": 'validated'
   ```

3. Add the `...Response` object which is mostly boilerplate, but still has a couple fields to update:

   - Fields to update:
     1. `...Response` with the name of the request (Ex. `AccountChannelResponse`)
     2. In the `mapping`: 3. Map `success` to a reference to the `...SuccessResponse` in **this** file (NOT the shared file!) 4. Map `error` to the the `...ErrorResponse` in the **SHARED** file
     3. In the oneOf, add BOTH of the above references in a list.
     4. `example` with a valid successful response of this type, ideally the exact response to sending the example in `...Request` in this file.

   ```
   ...Response:
      type: object
      properties:
        result:
          type: object
          discriminator:
            propertyName: status
            mapping:
              success: # Include a reference to ...SuccessResponse from this file
              error: # Include a reference to the **shared** ...ErrorResponse
          oneOf:
            - $ref: # Include a reference to ...SuccessResponse from this file
            - $ref: # Include a reference to the **shared** ...ErrorResponse
      required:
        - result
      example:
        # result:
        #   account: rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn
        #   channels:
        #     - account: rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn
        #       amount: '1000'
        #       balance: '0'
        #       channel_id: C7F634794B79DB40E87179A9D1BF05D05797AE7E92DF8E93FD6656E8C4BE3AE7
        #       destination_account: ra5nK24KXen9AHvsdFTKHSANinZseWnPcX
        #       public_key: aBR7mdD75Ycs8DRhMgQ4EMUEmBArF8SEh1hfjrT2V9DQTLNbJVqw
        #       public_key_hex: 03CFD18E689434F032A4E84C63E2A3A6472D684EAF4FD52CA67742F3E24BAE81B2
        #       settle_delay: 60
        #   ledger_hash: 27F530E5C93ED5C13994812787C1ED073C822BAEC7597964608F2C049C2ACD2D
        #   ledger_index: 71766343
        #   status: success
        #   validated: true
        ...
   ```

4. Create the `...SuccessResponse` schema to combine the `BaseSuccessResponse` and the shared success schema. (This is done to match the JSON RPC response format while re-using our shared schema)

   - Fields to update:
     1. `...SuccessResponse`
     2. Update the 2nd reference in `allOf` to the **SHARED** `...SuccessResponse` (NOT the one in this file!)

   ```
   ...SuccessResponse:
     type: object
     allOf:
       - $ref: '../../shared/base.yaml#/components/schemas/BaseSuccessResponse'
       - $ref: # Reference the `...SuccessResponse` in the **SHARED** folder
   ```

5. Lastly, we need to **update** the `open_api/json_api.yaml` file:

   - Fields to update:

   1. Update `#paths///post/requestBody/content/application/json/schema/discriminator/mapping` with a mapping between the request name and your `...Request` object **from the `..._open_api.yaml` file** (NOT the shared file!)

      - Ex. `account_channels: 'requests/account_channels_open_api.yaml#/components/schemas/AccountChannelsRequest'`

   2. Update the `oneOf` just below the `mapping` you modified with another reference to the `...Request` object from the `..._open_api.yaml` file

      - Ex. `- $ref: 'requests/account_channels_open_api.yaml#/components/schemas/AccountChannelsRequest'`

   3. Update `#paths///post/responses/200/content/application/json/schema/oneOf` with a reference to the **`...Response`** (NOT `...Request`) object from the `..._open_api.yaml` file.

      - Ex. `- $ref: 'requests/account_channels_open_api.yaml#/components/schemas/AccountChannelsResponse'`

Note: If you want to also add this request to the AsyncAPI, continue by [following these steps here](#asyncapi-specific-steps-for-adding-a-new-request)

## AsyncAPI-specific steps for adding a new request

_This section assumes you've already completed the shared work steps for this request in [How to add a new request](#how-to-add-a-new-request)_

At a high level, we're going to wrap the core types we defined in `shared/` in boilerplate so it matches the Websocket formatting `rippled` expects / produces, then we're going to reference our wrapped types in the core `websocket_api.yaml` file.

1. Create a new file in `async_api/requests` named `..._async_api.yaml` for your new request. Ex. `account_channels_async_api.yaml`

   - The reason to include `_async_api` in the name is to make it easier to tell which file we're referencing throughout the codebase, and to make filename searches less confusing when debugging. Including it at the end also makes it easier to at a glance find the right file in the explorer.
   - Example file: [async_api/requests/account_channels_async_api.yaml](./async_api/requests/account_channels_async_api.yaml)

2. Add a `...Request` schema with the following boilerplate and an example which references the `...Request` we defined in `shared/requests`. See template below:

   - Fields to update:
     1. `...Request` with the name of the request (Ex. `AccountChannelRequest`)
     2. `description` with a long explanation of what the request is (use xrpl.org text if available)
     3. `allOf`'s `-$ref:` to reference the `...Request`we defined in `shared/requests`
     4. `command` with the request name (ex. `account_channels`)
     5. `example` with a valid request of this type that includes most if as many optional fields as possible while still being valid

   ```
   ...Request:
      description: >
        ...
      type: object
      allOf:
        - $ref: ... # Reference the Request in `shared/requests` here
      properties:
        command:
          type: string
          enum: # This is the most supported way to define a specific string as the only valid input. `const` is a new keyword which is supported in OpenAPI, but not in all corresponding codegen tools. https://github.com/OAI/OpenAPI-Specification/issues/1313
            - ...
        id:
          # Not specifying a type is how we express "any" value is acceptable
          description: 'A unique identifier for the request.'
      required:
        - command
        - id
      example:
        # Show a valid request that follows the schema here, for example for account_channels:
        # id: 1
        # command: account_channels
        # account: rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn
        # destination_account: ra5nK24KXen9AHvsdFTKHSANinZseWnPcX
        # ledger_index: validated
        ...
   ```

3. Add the `...Response` object which is mostly boilerplate, but still has a couple fields to update:

   - Fields to update:
     1. `...Response` with the name of the request (Ex. `AccountChannelResponse`)
     2. In the oneOf, the first entry should reference the `...SuccessResponse` in **this** file (NOT the shared file!)
     3. In the oneOf, the second entry should reference the `...ErrorResponse` in **this** file (NOT the shared file!)
     4. `example` with a valid successful response of this type, ideally the exact response to sending the example in `...Request` in this file.

   ```
   ...Response:
     discriminator: status
     oneOf:
       - $ref: # Reference the ...SuccessResponse in this file
       - $ref: # Reference the ...ErrorResponse in this file
     type: object
     properties:
       id:
         # Not specifying a type is how we express "any" value is acceptable
         description: 'A unique identifier for the request.'
       type:
         type: string
         description: The value response indicates a direct response to an API request. Asynchronous notifications use a different value such as `ledgerClosed` or `transaction`.
         enum: # This is the most supported way to define a specific string as the only valid input. `const` is a new keyword which is supported in OpenAPI, but not in all corresponding codegen tools. https://github.com/OAI/OpenAPI-Specification/issues/1313
           - response
     required:
       - id
       - type
     example:
      # Example formatting for `account_channels` response
      # id: 1
      # result:
      #   account: rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn
      #   channels:
      #     - account: rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn
      #       amount: '1000'
      #       balance: '0'
      #       channel_id: C7F634794B79DB40E87179A9D1BF05D05797AE7E92DF8E93FD6656E8C4BE3AE7
      #       destination_account: ra5nK24KXen9AHvsdFTKHSANinZseWnPcX
      #       public_key: aBR7mdD75Ycs8DRhMgQ4EMUEmBArF8SEh1hfjrT2V9DQTLNbJVqw
      #       public_key_hex: 03CFD18E689434F032A4E84C63E2A3A6472D684EAF4FD52CA67742F3E24BAE81B2
      #       settle_delay: 60
      #   ledger_hash: 27F530E5C93ED5C13994812787C1ED073C822BAEC7597964608F2C049C2ACD2D
      #   ledger_index: 71766343
      #   validated: true
      # status: success
      # type: response
      ...
   ```

4. Create the `...SuccessResponse` schema to combine the `BaseSuccessResponse` and the shared success schema. (This is done to match the JSON RPC response format while re-using our shared schema)

   - Fields to update:
     1. `...SuccessResponse`
     2. Update the 2nd reference in `allOf` to the **SHARED** `...SuccessResponse` (NOT the one in this file!)

   ```
   AccountChannelsSuccessResponse:
     type: object
     allOf:
       - $ref: '../../shared/base.yaml#/components/schemas/BaseSuccessResponse'
       - $ref: # Reference the `...SuccessResponse` in the **SHARED** folder
   ```

5. Lastly, we're going to update the `websocket_api.yaml` file to reference our newly created `Websocket` wrapper of our `rippled` request / response types.

   1. In `subscribe` add a **new** `message` object for your new request which references the `...Request` we made in the `..._async_api.yaml` (NOT the shared version!)

      - Fields to update:
        1. `messageId` with the name of your request + `Request` (Ex. `AccountChannelsRequest`)
        2. `$ref` with a reference to the `...Request` object in the `..._async_api.yaml` file (NOT the shared version!)
           - Ex. `'./requests/account_channels_async_api.yaml#/components/schemas/AccountChannelsRequest'`

      ```
      message:
        messageId: '...Request'
        payload:
          $ref: ...
      ```

   2. Do the same in the `publish` section except for `Response` instead of `Request`

      - Fields to update:
        1. `messageId` -> `...Response`
        2. `$ref` should point to the `...Response` (not `...Request`) schema from the `..._async_api.yaml` file (NOT the shared version!)

Note: If you want to also add this request to the OpenAPI spec _and haven't already_, continue by [following these steps here](#asyncapi-specific-steps-for-adding-a-new-request)

# Contributing Guidelines

## Preferences

In situations where there are multiple equivalent ways to write this spec, this outlines the choices we’ve made that we want to keep consistent. If we update these, please update them for ALL entries in ALL specs for consistency’s sake.

1.  `required` is specified at the bottom of request / response schemas by listing required fields - NOT specified in every individual field. (This makes it easier to at-a-glance see if the list of required fields are all there / what they are, but makes it slightly harder to read individual fields and know if they’re required or not).
2.  In order to specify the request / response type for JSON RPC, we need to use a generic path (`/`) and a [`discriminator`](https://redocly.com/docs/resources/discriminator/) which allows us to derive the “type” of an object from the value in a specific parameter in the request. (In the case of the JSON RPC API, the `method` field tells us the type of request, which corresponds exactly with 1 or 2 response types)
    - The one case where this isn’t enough information is when a request has a `binary` option - in which case there are 2 possible response structures.
3.  Error responses in the "path" section represent HTTP response / errors. `rippled` or `clio` errors are treated as valid responses, and should be documented as `oneOf` the possible representations for each individual request response. Although rippled errors share a similar shape, ultimately we want to be very clear on what the specific error codes that are possible from each request.

# Things to investigate

1. We'll need to fix the CORS error for the Redocly "Try it" feature when we deploy on xrpl.org. That should be a server setting.
1. We'll need to talk to Redocly about getting them to support "Try it" for AsyncAPI specs (should be similar code).
1. It's unclear the best way to set up the primary api file (websocket_api.yaml and json_api.yaml) to pair specific input parameters to a specific response. As it is now, both api descriptions have a list of possible parameters for each `rippled` request, but it's defined as two lists rather than a list of input/output pairs. One idea for how to solve this is maybe we can define multiple `post` requests
1. Should we use AsyncAPI 2.6.0 (currently partially supported by Redocly) or use AsyncAPI 3.0.0 (cleaner interface & resolves input / output pairing problem)

1. Currently, the way we test the spec is through including examples which we can validate against rippled using the "Try It" feature in Redocly previews. That's not a robust way to test all possible inputs / outputs of rippled requests. Some enhancements we can consider for this long-term:

   1. Having examples which reproduce every error case for a specific request
   2. Verifying that we have unit tests for every possible error code in our test suite

1. Note on the formatting of this README - for some reason prettier formats code blocks with one-space indents instead of 2 (in the yaml file 2 space indents are used). This makes the examples slightly harder to copy and paste, although they should work. Would be nice to fix that.
