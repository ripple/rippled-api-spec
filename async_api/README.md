# XRPL AsyncAPI Specification

This package provides the AsyncAPI specification for the XRP Ledger ([XRPL](https://xrpl.org)) WebSockets API.

## Installation

Install the package via npm:

```bash
npm install @xrpl/rippled-asyncapi-spec
```

## Usage

Once installed, import the AsyncAPI specification file directly from the package:

```javascript
import xrplSpec from '@xrpl/rippled-asyncapi-spec/asyncapi.json'
```

You can then use the specification with tools like Postman, or AsyncAPI clients to [generate client libraries](https://github.com/ripple/openapi-codegen-xrpl).
