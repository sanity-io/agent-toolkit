---
name: sanity-schema-manager
description: Manages schema lifecycle including scaffolding, safe field deprecation, and data migrations. Use when modifying existing schemas.
---

# Schema Manager

This skill handles the lifecycle of Sanity Schema types.

## Procedure

1.  **Scaffold (Create)**
    *   Use templates to create `document`, `object`, or `singleton` types.
    *   **Constraint:** Ensure `defineType` and `defineField` are used.
    *   **Constraint:** Ensure an icon is imported from `@sanity/icons`.

2.  **Deprecate (Update)**
    *   Ask: "Which field do you want to deprecate?"
    *   **Action:** Apply the "ReadOnly -> Hidden -> Deprecated" pattern to the field definition.
    *   **Output:**
        ```typescript
        defineField({
          name: 'oldField',
          deprecated: { reason: 'Use newField instead' },
          readOnly: true,
          hidden: ({value}) => value === undefined,
          initialValue: undefined
        })
        ```

3.  **Migrate (Data)**
    *   Generate a migration script using `@sanity/migrate` or standard client patches.
    *   **Template:** Iterate over documents -> `patch(doc.id).set({ newField: doc.oldField }).unset(['oldField'])`.

4.  **Clean (Delete)**
    *   Only allow deleting a field definition if the user confirms "I have migrated the data and the field is undefined in all documents."
