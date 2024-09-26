# How to add a new transaction

- There's a decent amount of boilerplate code, so each step will include a template you should copy along with a list of which fields need updating.
- `...` in the template indicates you should edit something (Ex. Replacing `...Transaction` with `PaymentTransaction`)
- If this is for a transaction documented on xrpl.org, please copy and paste the documentation from there.
- Read through `shared/base.yaml` after doing a draft of your spec to see if there are any re-usable components that make sense for your transaction.
- Please note that the transactions are created as an option for the `tx_json` field of the `submit` method in sign-and-submit mode.

1.  _If you've already created a spec in the shared folder for this request, skip to the OpenAPI specific steps!_

2.  Create a new file for the rippled request / response information in `shared/transactions/<transaction_name.yaml>`

    - For example: [`shared/transactions/payment.yaml`](/shared/transactions/payment.yaml)

3.  In that shared file, add the `Transaction` type.

    1.  `...` indicates you should edit something (Ex. Replacing `...Transaction` with `PaymentTransaction`)
    2.  If this is for a transaction documented on xrpl.org, please copy and paste the documentation from there.
    3.  Read through `shared/base.yaml` to see if there are any re-usable components that make sense for your transaction

    - Fields to update:

      1. `...Transaction` with the name of the transaction (ex. `Payment`)
      2. `description:` with a description of this transaction
      3. If there are any common fields in `shared/base.yaml` that can be re-used, do so with `allOf` - otherwise delete that TODO comment.
      4. `properties` with the parameters for this transaction (in alphabetical order)
      5. `required` with a list of any required parameters (in alphabetical order)

         ```
             ...Transaction:
               description: >
                 ...
               type: object
               # TODO: Add any common fields from `shared/base.yaml` that are applicable using `allOf`. Otherwise delete these comments! For example:
               # allOf:
               #  - $ref: '../base.yaml#/components/schemas/BaseTransaction'
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

    4. If there are multiple versions of this transaction across multiple rippled API versions, [follow the instructions here](./add-a-new-rippled-api-version.md)

    5. Add the transaction to the transaction requests (For example, `submit`, `tx`, etc.)

    - This example below add the `Payment` transaction to `submit` request:
      ```
      SignAndSubmitModeV1:
        type: object
        allOf:
          - $ref: '#/components/schemas/SignAndSubmitModeBase'
        properties:
          tx_json:
            type: object
            discriminator:
              propertyName: TransactionType
              mapping:
                Payment: '../transactions/payment.yaml#/components/schemas/PaymentTransactionV1'
            oneOf:
              - $ref: '../transactions/payment.yaml#/components/schemas/PaymentTransactionV1'
      ```
