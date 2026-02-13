# Function Best Practices

> **Tag**: `Official (core)`

## 1. Prefer Queries/Mutations Over Actions

Actions are powerful but should be used **sparingly**. Default to queries/mutations.

```typescript
// ❌ BAD: Action for simple DB work
export const getUser = action({
  handler: async (ctx, args) => {
    return await ctx.runQuery(api.users.get, args);
  },
});

// ✅ GOOD: Just use a query
export const getUser = query({
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});
```

**Use actions only when you need:**
- External API calls (Stripe, OpenAI, Resend)
- Long-running work
- Non-deterministic operations

📖 [Zen: Don't misuse actions](https://docs.convex.dev/understanding/zen#dont-misuse-actions)

---

## 2. Argument Validation on All Public Functions

All public `query`, `mutation`, `action` MUST define `args` with `v.*` validators.

```typescript
// ✅ GOOD: Explicit validation
export const createTask = mutation({
  args: { 
    title: v.string(),
    priority: v.optional(v.number()),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => { ... },
});

// ❌ BAD: No validation (accepts anything)
export const createTask = mutation({
  handler: async (ctx, args: any) => { ... },
});
```

**Exception**: Internal functions may omit validation when called only from trusted code.

📖 [Best practices: Functions](https://docs.convex.dev/understanding/best-practices/other-recommendations#functions)

---

## 3. Helper Functions for Shared Logic

Keep queries/mutations thin. Extract shared logic to `convex/lib/*`.

```typescript
// convex/lib/tasks.ts
export async function validateTaskOwnership(
  ctx: QueryCtx,
  taskId: Id<"tasks">,
  userId: string
) {
  const task = await ctx.db.get(taskId);
  if (!task) throw new ConvexError("Not found");
  if (task.userId !== userId) throw new ConvexError("Forbidden");
  return task;
}

export function calculatePriority(dueDate: number, importance: number): number {
  const daysLeft = (dueDate - Date.now()) / (1000 * 60 * 60 * 24);
  return importance * (1 / Math.max(daysLeft, 1));
}

// convex/features/tasks/functions.ts
import { validateTaskOwnership, calculatePriority } from "../lib/tasks";

export const updateTask = mutation({
  args: { taskId: v.id("tasks"), title: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");
    
    // Thin function: delegates to helpers
    const task = await validateTaskOwnership(ctx, args.taskId, identity.subject);
    await ctx.db.patch(args.taskId, { title: args.title });
  },
});
```

📖 [Best practices: Functions](https://docs.convex.dev/understanding/best-practices/other-recommendations#functions)

---

## 4. Await All Promises

Always `await` promises in Convex functions. Floating promises cause subtle bugs.

```typescript
// ❌ BAD: Floating promise (may not complete)
export const scheduleReminder = mutation({
  handler: async (ctx, args) => {
    ctx.scheduler.runAfter(1000, api.notifications.send, { ... });
    ctx.db.patch(args.taskId, { reminded: true });
  },
});

// ✅ GOOD: All promises awaited
export const scheduleReminder = mutation({
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(1000, api.notifications.send, { ... });
    await ctx.db.patch(args.taskId, { reminded: true });
  },
});
```

📖 [Best practices: Await all promises](https://docs.convex.dev/understanding/best-practices/#await-all-promises)

---

## 5. Internal Functions for Sensitive Logic

Logic that should never be callable from the client lives in `internalQuery`, `internalMutation`, `internalAction`.

```typescript
// convex/features/billing/functions.ts

// ❌ Public: Client can call this directly
export const processRefund = mutation({ ... });

// ✅ Internal: Only callable from server-side code
export const processRefund = internalMutation({
  args: { paymentId: v.string(), amount: v.number() },
  handler: async (ctx, args) => {
    // Sensitive billing logic here
  },
});

// Public function can delegate to internal
export const requestRefund = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");
    
    const order = await validateOrderOwnership(ctx, args.orderId, identity.subject);
    
    // Delegate to internal function
    await ctx.runMutation(internal.billing.processRefund, {
      paymentId: order.paymentId,
      amount: order.amount,
    });
  },
});
```

📖 [Auth best practices](https://stack.convex.dev/authentication-best-practices-convex-clerk-and-nextjs#implementing-authentication-correctly)

---

## Verification Checklist

- [ ] Actions only used for external I/O or long-running work
- [ ] All public functions have `args` with validators
- [ ] Shared logic extracted to `convex/lib/*` helpers
- [ ] All promises are `await`ed (no floating promises)
- [ ] Sensitive logic in `internal*` functions, not public
