# Contribution Guidelines for AsyncAPI Specifications

This document outlines the guidelines contributors must follow when working on the AsyncAPI specifications, focusing on the use of **`$id`**. Proper usage of `$id` ensures smooth code generation, schema identification, and maintains clarity within complex, nested components.

---

## Why `$id` is Important

The `$id` property serves multiple purposes in the context of AsyncAPI specifications, including:

1. **Unique Identification**: It provides a unique identifier for schema components, enabling reuse without conflicts.
2. **Code Generation Support**: When used consistently, `$id` ensures the AsyncAPI code generator can generate interfaces or types with meaningful, unique names.
3. **Version Control**: It helps differentiate between versions or variations of similar components (e.g., `TransactionV1`, `TransactionV2`).
4. **Avoiding Conflicts**: Using `$id` in nested and reusable objects prevents ambiguity when multiple components are referenced or extended across schemas.
5. **Clarity and Maintainability**: Properly assigned `$id` values make the specification easier to read, maintain, and extend over time.

---

## When and Where to Use `$id`

To ensure consistency and reliability, the `$id` property **must be used in the following scenarios**:

1. **Top-Level Schema Definitions**:
   - **Situation**: When creating new schemas or message components under `components/schemas` or `components/messages`.
   - **Reason**: Ensures that each schema is uniquely identifiable and properly named during code generation.

   **Example**:
   ```yaml
   components:
     schemas:
       PaymentTransactionV2:
         $id: PaymentTransactionV2
         type: object
         properties:
           ...
   ```

2. **Reusable or Shared Components**:
   - **Situation**: When defining nested objects or arrays that are used across multiple schemas (e.g., `Memo`, `Warning`, `PathStep`).
   - **Reason**: These components need to be uniquely identifiable to prevent conflicts during code generation and ensure reusability.

   **Example**:
   ```yaml
   properties:
     warnings:
       type: array
       items:
         $id: Warning
         type: object
         properties:
           ...
   ```

3. **Nested Objects with Distinct Purpose**:
   - **Situation**: When an object inside another schema has a specific role or is reused across different schemas (e.g., `TransactionType` or `CurrencyAmount`).
   - **Reason**: Assigning an `$id` helps the generator create unique interfaces for these nested components, preventing naming issues.

   **Example**:
   ```yaml
   properties:
     TransactionType:
       $id: TransactionType
       type: string
       enum: ["Payment", "Transfer"]
   ```

4. **Extended or Composed Schemas**:
   - **Situation**: When using `allOf` to extend or compose schemas from multiple components (e.g., `BaseTransaction` reused across different versions).
   - **Reason**: Each extended version should have a unique `$id` to ensure the code generator distinguishes between them and maintains version clarity.

   **Example**:
   ```yaml
   allOf:
     - $id: BaseTransaction
       type: object
       properties:
         ...
     - $id: PaymentTransactionBase
       type: object
       properties:
         ...
   ```

5. **Versioned Components**:
   - **Situation**: When maintaining multiple versions of a schema (e.g., `TransactionV1`, `TransactionV2`).
   - **Reason**: Using `$id` to reflect the version ensures the code generator can generate appropriately named types for each version.

---

## Best Practices for Defining `$id`

- **Use Descriptive Names**: The value of `$id` should clearly describe the component's role (e.g., `Memo`, `Warning`, `PathStep`).
- **Maintain Consistent Versioning**: When creating new versions of a component, increment the version in the `$id` value (e.g., `TransactionV1`, `TransactionV2`).
- **Apply `$id` to Nested and Shared Components**: Even if the component is part of another schema, assign an `$id` if it has a unique role or is used in multiple places.

---

## Summary

By following these guidelines, contributors ensure that:
- The AsyncAPI specification remains consistent and maintainable.
- The code generator can create well-defined, conflict-free interfaces.
- Each schema and component is uniquely identifiable and reusable.