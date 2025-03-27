# **Custom Validation Rules for OpenAPI Specification**

## **OpenAPI Keywords for Properties**

Reference: [Swagger Data Types](https://swagger.io/docs/specification/v3_0/data-models/data-types)

A property in OpenAPI specs can be one of the following basic types:

- **string** (includes dates and files)
- **number**
- **integer**
- **boolean**
- **array**
- **object**

OpenAPI provides built-in keywords to specify constraints for properties:

### **String Constraints**

- `minLength`, `maxLength`: Define the allowed length.
- `pattern`: Define a regex pattern (e.g., hex format).

**Example:**

```yaml
MPTokenMetadata:
  type: string
  pattern: '^[0-9A-Fa-f]*$'
  description: |
    Arbitrary metadata about this issuance, in hex format. The limit for this field is 1024 bytes.
  minLength: 0
```

### **Number Constraints (`number`, `integer`)**

- `minimum`, `maximum`: Define the range of valid values.

**Example:**

```yaml
TradingFee:
  type: integer
  format: uint16
  description: |
    (Required) The fee to charge for trades against this AMM instance, in units of 1/100,000.
    A value of 1 is equivalent to 0.001%. The maximum value is 1000, indicating a 1% fee.
  minimum: 0
  maximum: 1000
```

### **Array Constraints**

- `minItems`, `maxItems`: Define the allowed array length.
- `uniqueItems`: Defines the elements must be unique in the array.

**Example:**

```yaml
NFTokenOffers:
  type: array
  items:
    type: string
  minItems: 1
  description: |
    An array of IDs of the NFTokenOffer objects to cancel. Each entry must be unique.
```

---

## **Custom Validation via OpenAPI Vendor Extensions**

Reference: [Swagger OpenAPI Extensions](https://swagger.io/docs/specification/v3_0/openapi-extensions)

Users can define custom validations using vendor extensions (`x-custom-validation`), which allow adding extra constraints beyond standard OpenAPI rules.

Custom validations can be applied on:

1. Specific property
2. Rules involving combinations of properties

### **Custom Validation Rules**

Below are the available validation rules in **`x-custom-validation`**, designed based on the current `rippled` API. These rules may evolve as the API expands.

---

## **Validation Rule Definitions**

## Custom Property Validations

### **isAccount**

Verifies a valid XRPL base58 account.

**Structure:**

```yaml
x-custom-validation:
  isAccount: true
```

**Example:**

```yaml
BaseTransaction:
  type: object
  properties:
    Account:
      type: string
      x-custom-validation:
        isAccount: true
```

### **isNumericString**

Verifies a string field must be numeric.

**Structure:**

```yaml
x-custom-validation:
  isNumericString: true
```

**Example:**

```yaml
SignatureReward:
  type: string
  x-custom-validation:
    isNumericString: true
```

### **specialValue**

Verifies a field can have a special value outside its range.

**Structure:**

```yaml
x-custom-validation:
  specialValue: 0
```

**Example:**

```yaml
TransferRate:
  type: integer
  minimum: 1000000000
  maximum: 2000000000
  x-custom-validation:
    specialValue: 0
```

### **isLowerCase**

Verifies a field is in lower case.

**Structure:**

```yaml
x-custom-validation:
  isLowerCase: true
```

**Example:**

```yaml
Domain:
  type: string
  format: hex
  maxLength: 256
  x-custom-validation:
    isLowerCase: true
```

### **amountGreaterThan**

Verifies Amount property is greater than a specified value.

**Structure:**

```yaml
x-custom-validation:
  amountGreaterThan: 0
```

**Example:**

```yaml
Amount:
  type: string
  x-custom-validation:
    amountGreaterThan: 0
```

### **greaterThan / lessThan**

Ensures a field is strictly greater or less than a value. It applies only to integer fields.

**Structure:**

```yaml
x-custom-validation:
  greaterThan: 0
  lessThan: 1000
```

**Example (greaterThan):**

```yaml
LastUpdateTime:
  type: integer
  x-custom-validation:
    greaterThan: 946684799
```

## Custom Validations Involving Multiple Properties

### **mutualPresence**

Verifies two fields that are required together if any is presented.

**Structure:**

```yaml
x-custom-validation:
  mutualPresence:
    - field1: { { fieldname } }
      field2: { { fieldname } }
```

**Example:**

```yaml
x-custom-validation:
  mutualPresence:
    - field1: Condition
      field2: Fulfillment
```

### **dependentPresence**

Verifies requiredFields must be specified if dependentField is not empty.

**Structure:**

```yaml
x-custom-validation:
  dependentPresence:
    - dependentField: { { fieldname } }
      requiredFields:
        - { { fieldname } }
        - { { fieldname } }
```

**Example:**

```yaml
x-custom-validation:
  dependentPresence:
    - dependentField: NFTokenBrokerFee
      requiredFields:
        - NFTokenSellOffer
        - NFTokenBuyOffer
```

### **mutualExclusion**

Verifies if one field is set, then the other must not be set.

**Structure:**

```yaml
x-custom-validation:
  mutualExclusion:
    - field1: { { fieldname } }
      field2: { { fieldname } }
```

**Example:**

```yaml
x-custom-validation:
  mutualExclusion:
    - field1: Amount
      field2: DeliverMin
```

### **isDifferent**

Verifies two fields must have different values.

**Structure:**

```yaml
x-custom-validation:
  isDifferent:
    - field1: { { fieldname } }
      field2: { { fieldname } }
```

**Example:**

```yaml
x-custom-validation:
  isDifferent:
    - field1: Issuer
      field2: Account
```

### **requireOneOf**

Verify at least one within a set of fields is required.

**Structure:**

```yaml
x-custom-validation:
  requireOneOf:
    - fields:
        - { { fieldname } }
        - { { fieldname } }
      message: 'Require at-least one of these fields.'
```

**Example:**

```yaml
x-custom-validation:
  requireOneOf:
    - fields:
        - LPTokenOut
        - Amount
      message: 'Require at-least one of these LPTokenOut or Amount.'
```

### **requireExactlyOne**

Verifies that exactly one field is present.

**Structure:**

```yaml
x-custom-validation:
  requireExactlyOne:
    - fields:
        - { { fieldname } }
        - { { fieldname } }
      message: 'Exactly one field must be present.'
```

**Example:**

```yaml
x-custom-validation:
  requireExactlyOne:
    - fields:
        - Authorize
        - AuthorizeCredentials
        - Unauthorize
        - UnauthorizeCredentials
      message: 'You must provide exactly one of Authorize, AuthorizeCredentials, Unauthorize, or UnauthorizeCredentials.'
```

### **conditionalRequiredOnFlag / conditionalForbiddenOnFlag**

Verifies a field must (must not) be set if a flag is set/not set.

**Example (conditionalRequiredOnFlag):**

If tfSellNFToken is not set on Flags then Owner field must be present.

```yaml
conditionalRequiredOnFlag:
  - requiresFlag: tfSellNFToken
    flagField: Flags
    condition: false
    field: Owner
    message: 'Must be present for buy offers.'
```

**Example (conditionalForbiddenOnFlag):**

If asfAuthorizedNFTokenMinter is not set on SetFlag then NFTokenMinter field must be absent.

```yaml
conditionalForbiddenOnFlag:
  - requiresFlag: asfAuthorizedNFTokenMinter
    flagField: SetFlag
    condition: false
    field: NFTokenMinter
    message: 'NFTokenMinter must not be set if asfAuthorizedNFTokenMinter is not present.'
```

### **conditionalGreaterThanOnFlag / conditionalLessThanOnFlag**

Verifies a field must be greater than or less than if a flag is set/not set.

**Example (conditionalGreaterThanOnFlag):**

If tfSellNFToken is not set on Flags then Amount field must be greater than 0.

```yaml
conditionalGreaterThanOnFlag:
  - requiresFlag: tfSellNFToken
    flagField: Flags
    condition: false
    field: Amount
    value: 0
    message: 'Must be greater than 0 for a buy offer.'
```

**Example (conditionalLessThanOnFlag):**

If tfSellNFToken is set on Flags then Amount field must be less than 0.

```yaml
conditionalLessThanOnFlag:
  - requiresFlag: tfSellNFToken
    flagField: Flags
    condition: true
    field: Amount
    value: 0
    message: 'Must be less than 0.'
```

### **flagConflict**

Verifies that only one flag in the list can be set.

**Structure:**

```yaml
x-custom-validation:
  flagConflict:
    - flagField: Flags
      flags:
        - { { flag1 } }
        - { { flag2 } }
```

**Example:**

```yaml
x-custom-validation:
  flagConflict:
    - flagField: Flags
      flags:
        - tfMPTLock
        - tfMPTUnlock
```

### **matchingCurrencyType**

Verifies two amount fields must be XRP-XRP or IOU-IOU.

**Structure:**

```yaml
x-custom-validation:
  matchingCurrencyType:
    - field1: { { fieldname } }
      field2: { { fieldname } }
```

**Example:**

```yaml
x-custom-validation:
  matchingCurrencyType:
    - field1: XChainBridge.IssuingChainIssue
      field2: XChainBridge.LockingChainIssue
```

### **notXRPAmount**

Verifies an amount field must not be XRP.

**Structure:**

```yaml
x-custom-validation:
  notXRPAmount:
    field: { { fieldname } }
```

**Example:**

```yaml
x-custom-validation:
  notXRPAmount:
    - field: Amount
```

---

## **Custom Rule Definitions**

If none of the above rules apply, users can define custom validation rules.

**Example:**

```yaml
x-custom-validation:
  validate{{tx_name}}:
    - message: 'specified rules here'
```

This document provides a structured set of validation rules for OpenAPI specs. Users and maintainers can extend these rules as the API evolves.
