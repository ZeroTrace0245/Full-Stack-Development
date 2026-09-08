# Offline Synchronization

Offline support should preserve local work until connectivity returns.

## Recommended flow
1. Detect connectivity changes.
2. Queue local mutations.
3. Retry with bounded backoff.
4. Send mutations in a deterministic order.
5. Record the server acknowledgement.
6. Resolve conflicts explicitly.

The existing sync service and verification script are the starting point for this workflow.
