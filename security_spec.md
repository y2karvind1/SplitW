# Security Specification for Splitwise Pro Clone

## 1. Data Invariants
- A user can only access groups they are a member of.
- An expense must belong to a valid group.
- The `memberIds` array in a Group document must be kept in sync with the `members` subcollection for query optimization (though rules will primarily use the subcollection for authority).
- Only group members can add/view expenses.
- Only the creator or an admin can delete a group.
- Users cannot modify other users' global profiles.
- Any expense update must be validated for schema integrity.

## 2. The "Dirty Dozen" Payloads (Denial Tests)

1. **Identity Spoofing**: Creating an expense with `paidBy` set to another user.
2. **Unauthorized Group Access**: Attempting to read expenses of a group the user isn't in.
3. **Ghost Field Injection**: Adding `isAdmin: true` to a user profile or group member doc.
4. **Member Hijacking**: Adding oneself to a group's `memberIds` without proper authorization.
5. **Orphaned Expense**: Creating an expense for a non-existent groupId.
6. **Negative Amount**: Creating an expense with a negative amount.
7. **Malformed Splits**: Creating an expense where split percentages don't total 100%.
8. **Impersonation**: Updating another user's display name in the global `users` collection.
9. **History Tampering**: Updating the `createdAt` timestamp of an expense.
10. **State Lockdown Bypass**: Modifying a "settled" flag (if implemented) without permission.
11. **Resource Exhaustion**: Sending a 1MB string as a group description.
12. **PII Leak**: A signed-in user trying to list all global user profiles to scrape emails.

## 3. The Test Runner Plan
I will implement `firestore.rules.test.ts` using the Firebase Emulator (conceptually, though I'll write the code for verification) to ensure these payloads return `PERMISSION_DENIED`.

---
*Next: Generating DRAFT_firestore.rules based on these invariants.*
