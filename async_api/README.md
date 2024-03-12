# TODO: Need to determine if we should use 3.0.0 or 2.6.0

ReDocly currently only supports 2.6.0, but they're also in the beta of supporting AysncAPI anyway, so we may be able to influence them to support the more modern version (which does have some solid readability improvements and is where all updates will be going forward).
AsyncAPI 3.0.0 also solves the problem of how to tie requests to responses very elegantly by having responses define what request prompted them, whereas 2.6.0 has the same problem OpenAPI does with tying inputs to outputs when a single request shape has wildly different outputs.
