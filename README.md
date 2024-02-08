# rippled-api-spec
A repository for OpenAPI / AsyncAPI specifications. This ideally eventually can be used to automatically generate code and docs to simplify supporting rippled changes over time.

This will eventually contain specifications for rippled's JSON RPC API and Websocket API.

These apis will aim to eventually include all requests for both `rippled` and `clio`, supporting both v1 and v2 rippled api interfaces.

The JSON RPC API will be written out using [OpenAPI](https://www.openapis.org/) as it has a more direct request / response format.
The Websocket API will be written using [AsyncAPI] which better matches the ways in which the Websocket interface can asynchronously call back with things like `stream`. 

## Preferences

In situations where there are multiple equivalent ways to write this spec, this outlines the choices we’ve made that we want to keep consistent. If we update these, please update them for ALL entries in ALL specs for consistency’s sake. 


### OpenAPI (JSON RPC Preferences)

 1. `required` is specified at the bottom of request / response schemas by listing required fields - NOT specified in every individual field. (This makes it easier to at-a-glance see if the list of required fields are all there / what they are, but makes it slightly harder to read individual fields and know if they’re required or not).
 2. In order to specify the request / response type for JSON RPC, we need to use a generic path (`/`) and a [`discriminator`](https://redocly.com/docs/resources/discriminator/) which allows us to derive the “type” of an object from the value in a specific parameter in the request. (In the case of the JSON RPC API, the `method` field tells us the type of request, which corresponds exactly with 1 or 2 response types)
    - The one case where this isn’t enough information is when a request has a `binary` option - in which case there are 2 possible response structures.
 3. Error responses in the "path" section represent HTTP response / errors. `rippled` or `clio` errors are treated as valid responses, and should be documented as `oneOf` the possible representations for each individual request response. Although rippled errors share a similar shape, ultimately we want to be very clear on what the specific error codes that are possible from each request.

 ### Things to investigate
 - It seems that discriminator might be useless in OpenAPI 3.1?
    - https://github.com/OAI/OpenAPI-Specification/issues/2141 - Person who saw that no js spec validators checked `discriminator`
    - https://github.com/OAI/OpenAPI-Specification/issues/2143 - Bigger push to simply remove it in favor of inferring from JSON Schema
    - We may find it personally useful if we're customizing code generators for ourselves and need that specificity in terms of "errors" vs "successful" responses (although we could also just use naming conventions to figure it out)

 ### Adding a new request

To add a new request, there are three schemas you have to add, and a couple places you need to update.

1. Create a new file with the name of the request in camelCase (ex. `accountChannel.yaml`)
2. Create the Request schema (e.g. `AccountChannelsRequest`).
    - This should include `allOf BaseRequest`
    - It should also follow the xrpl.org documentation for the request. (These types are also mirrored in client libraries) ChatGPT can be a handy tool to convert from the plaintext on xrpl.org or the interface descriptions in xrpl.js to OpenAPI compliant schemas with the same documentation for each field.
3. Create the Response schema (note that by our convention, error responses from rippled must be defined in the corresponding Response schema NOT in the `paths` or as a separate schema)
    - All responses should be `oneOf` the normal response and the error response from rippled.
    - For the normal response
        - Include `allOf BaseResponse`
        - # TODO: Jackson
4. Include a reference to the Response in `json_api.yaml` under the `RequestType` schema in the `components` section.
    - Add a discriminator mapping (ex. `account_channels: $ref: 'accountChannels.yaml#/AccountChannelRequest'`)
        - Example syntax to reference a schema in another file: `$ref: '../document.yaml#/myElement'` [More details](https://swagger.io/docs/specification/using-ref/)
    - Add the ref to the pool of options (in the `anyOf` section below the discriminator mapping)

    Here's what the code you should update here looks like:
    ```
    RequestType:
      discriminator:
        propertyName: method
        mapping:
          account_channels: "#/components/schemas/AccountChannelsRequest" # TODO: Verify this is the correct syntax
          # TODO: Add the rest of the JSON RPC requests here
        anyOf:
          - $ref: "#/components/schemas/AccountChannelsRequest"
          # TODO: Add the rest of the JSON RPC requests here
    ```

5. Include a reference to the Response in `json_api.yaml` under the `paths` section in the 200 area.
    - Add a discriminator mapping (ex. `account_channels: $ref: 'accountChannels.yaml#/AccountChannelResponse'`)
        - Example syntax to reference a schema in another file: `$ref: '../document.yaml#/myElement'` [More details](https://swagger.io/docs/specification/using-ref/)
    - Add the ref to the pool of options (in the `anyOf` section below the discriminator mapping)

    Here's what the code you should update here looks like:
    ```
    responses:
        "200":
          description: JSON-RPC response object
          content:
            application/json:
              schema:
                discriminator:
                    propertyName: method
                    mapping:
                        account_channels: "#/components/schemas/AccountChannelsResponse"
                		# TODO: Add the rest of the JSON RPC responses here

                    anyOf:
                        $ref: "#/components/schemas/AccountChannelsResponse"
                		# TODO: Add the rest of the JSON RPC responses here
    ```