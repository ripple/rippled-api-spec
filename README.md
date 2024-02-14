# rippled-api-spec

A repository for OpenAPI / AsyncAPI specifications. This ideally eventually can be used to automatically generate code and docs to simplify supporting rippled changes over time.

This will eventually contain specifications for rippled's JSON RPC API and Websocket API.

These apis will aim to eventually include all requests for both `rippled` and `clio`, supporting both v1 and v2 rippled api interfaces.

The JSON RPC API will be written out using [OpenAPI](https://www.openapis.org/) as it has a more direct request / response format.
The Websocket API will be written using [AsyncAPI] which better matches the ways in which the Websocket interface can asynchronously call back with things like `stream`.

_If you're new to **AsyncAPI**, you should read through [this tutorial](https://www.asyncapi.com/docs/tutorials/getting-started) and use [these reference docs](https://www.asyncapi.com/docs/reference/specification/v3.0.0) to look up any terms you see that are unfamiliar_

For instructions on updating / testing the OpenAPI spec, please see [open_api/README.md](./open_api/README.md)

For instructions on updating / testing the AsyncAPI spec, please see [async_api/README.md](./async_api/README.md)
