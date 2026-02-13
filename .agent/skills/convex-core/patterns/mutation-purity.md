# Mutation Purity

> **Tag**: `Official (core)`

## The Rule

Convex mutations are **atomic transactions with automatic retry on conflict**. They MUST be deterministic.

## Forbidden in Mutations

```typescript
// ❌ AUTO-REJECT: These break determinism
await fetch(...);           // Network calls
await email.send(...);      // External services
Date.now();                 // Non-deterministic time
Math.random();              // Non-deterministic values
crypto.randomUUID();        // Non-deterministic IDs
```

## The Fix: Action → Mutation

Actions run in Node.js and can do anything. Delegate to mutations for DB work.

```typescript
// ✅ Action orchestrates, Mutation executes
export const processPayment = action({
  args: { paymentIntentId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new ConvexError("Unauthorized");
    
    // External API call in Action
    const payment = await stripe.paymentIntents.retrieve(args.paymentIntentId);
    
    // Delegate to pure Mutation
    await ctx.runMutation(api.invoicing.recordPayment, {
      userId: user.subject,
      amount: payment.amount,
      status: payment.status,
      processedAt: Date.now(), // Pass time as arg
    });
  },
});

// Pure mutation - only DB operations
export const recordPayment = mutation({
  args: { 
    userId: v.string(), 
    amount: v.number(), 
    status: v.string(),
    processedAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("payments", args);
  },
});
```

## Why This Matters

1. **Automatic Retries**: Convex retries mutations on OCC conflicts. Non-deterministic code would produce different results on retry.
2. **Caching**: Convex caches query results. Determinism ensures cache validity.
3. **Time Travel**: Convex can replay transactions. Non-determinism breaks this.

## References

- [Server Functions](https://docs.convex.dev/understanding#server-functions)
- [Zen: Don't Misuse Actions](https://docs.convex.dev/understanding/zen#dont-misuse-actions)
- [Determinism Restrictions](https://docs.convex.dev/functions/runtimes#restrictions-on-queries-and-mutations)
