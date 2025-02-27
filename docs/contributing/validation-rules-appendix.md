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

### **Custom Validation Rules**

Below are the available validation rules in **`x-custom-validation`**, designed based on the current `rippled` API. These rules may evolve as the API expands.

---

## **Validation Rule Definitions**

### **isAccount**

Verifies a valid XRPL base58 account.

**Structure:**

```yaml
x-custom-validation:
  isAccount:
    - field: { { fieldname } }
```

**Example:**

```yaml
x-custom-validation:
  isAccount:
    - field: OtherChainSource
```

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

Verifies one field must be specified if the other is not empty.

**Structure:**

```yaml
x-custom-validation:
  dependentPresence:
    - dependentField: { { fieldname } }
      requiredField: { { fieldname } }
```

**Example:**

```yaml
x-custom-validation:
  dependentPresence:
    - dependentField: Amount2
      requiredField: Amount
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

### **validCredentials**

Verifies a valid set of Credential IDs.

**Structure:**

```yaml
x-custom-validation:
  validCredentials:
    field: { { fieldname } }
```

**Example:**

```yaml
x-custom-validation:
  validCredentials:
    field: CredentialIDs
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

### **isNumericString**

Verifies a string field must be numeric.

**Structure:**

```yaml
x-custom-validation:
  isNumericString:
    - field: { { fieldname } }
```

**Example:**

```yaml
x-custom-validation:
  isNumericString:
    - field: Amount
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

### **requireOneOf**

Verify at least one within a set of fields is required.

**Structure:**

```yaml
x-custom-validation:
    requireOneOf:
        - fields:
            - {{fieldname}}
            - {{fieldname}}
            …

```

**Example:**

```yaml
x-custom-validation:
  requireOneOf:
    - fields:
        - LPTokenOut
        - Amount
```

### **conditionalRequired / conditionalForbidden**

Verifies a set of fields must (must not) be set if a field/flag is set.

**Example (conditionalRequired):**

```yaml
conditionalRequired:
  - field: NFTokenBrokerFee
    requires:
      - NFTokenSellOffer
      - NFTokenBuyOffer
```

**Example (conditionalForbidden):**

```yaml
conditionalForbidden:
  - field: Flags.tfSellNFToken
    forbids:
      - field: Owner
```

### **greaterThan / lessThan**

Ensures a field is strictly greater or less than a value.

**Example (greaterThan):**

```yaml
x-custom-validation:
  greaterThan:
    - field: Amount
      value: 0
```

**Example (lessThan):**

```yaml
x-custom-validation:
  lessThan:
    - field: Amount
      value: 1000
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

### **specialValue**

Verifies a field can have a special value outside of its range.

**Structure:**

```yaml
x-custom-validation:
  specialValue:
    - field: { { fieldname } }
      specialValue: { { value } }
```

**Example:**

```yaml
x-custom-validation:
    specialValue:
        - field: TransferRate
        specialValue: 0
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
