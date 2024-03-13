# OpenAPI

Instructions for testing and extending this OpenAPI specification for the JSON RPC commands in rippled.

_If you're new to OpenAPI, you should read through [this tutorial](https://learn.openapis.org/specification/) and use [these reference docs](https://spec.openapis.org/oas/v3.1.0) to look up any terms you see that are unfamiliar_

## Table of Contents

- [Testing your specification](#testing-your-specification)
- [Preferences](#preferences)
  - [Things to investigate](#things-to-investigate)
- [How to add a new Request](#how-to-add-a-new-request)

### Things to investigate

- It seems that discriminator might be useless in OpenAPI 3.1?
  - https://github.com/OAI/OpenAPI-Specification/issues/2141 - Person who saw that no js spec validators checked `discriminator`
  - https://github.com/OAI/OpenAPI-Specification/issues/2143 - Bigger push to simply remove it in favor of inferring from JSON Schema
  - We may find it personally useful if we're customizing code generators for ourselves and need that specificity in terms of "errors" vs "successful" responses (although we could also just use naming conventions to figure it out)
