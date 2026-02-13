---
name: Convex Core
description: Convex + Next.js 15 architectural patterns, conventions, and anti-patterns for reactive, type-safe applications.
---

# Convex Core Skill

> **System Identity**: "Antigravity" — Reactive, Atomic, Type-Safe, Self-Healing.

This skill encodes patterns for building scalable, real-time systems with Convex and Next.js 15. Rules are tagged by source:

| Tag | Meaning |
|-----|---------|
| `Official (core)` | Convex docs/runtime requirements |
| `Official (ecosystem)` | `convex-helpers` / Stack articles |
| `Convention` | Project-specific, stricter than docs |
| `Framework` | Next.js-specific, outside Convex scope |

---

## Quick Reference

### Mutation Purity `Official (core)`
Mutations must be **deterministic**. No `fetch()`, `Date.now()`, `Math.random()`.

```typescript
// ❌ FORBIDDEN in mutations
await fetch(...);
Date.now();
Math.random();

// ✅ Side effects → Action → runMutation
export const processPayment = action({
  handler: async (ctx, args) => {
    const payment = await stripe.paymentIntents.retrieve(args.id);
    await ctx.runMutation(api.payments.record, { ...payment });
  },
});
```

📖 [Determinism docs](https://docs.convex.dev/understanding#server-functions) · [Zen: Don't misuse actions](https://docs.convex.dev/understanding/zen#dont-misuse-actions)

---

### Auth + Authorization `Official (core)`
Every public function MUST have access control.

```typescript
export const updateProfile = mutation({
  args: { userId: v.id("users"), name: v.string() },
  handler: async (ctx, args) => {
    // 1. Authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");
    
    // 2. Authorization
    const user = await ctx.db.get(args.userId);
    if (user?.clerkId !== identity.subject) throw new ConvexError("Forbidden");
    
    await ctx.db.patch(args.userId, { name: args.name });
  },
});
```

**Alternative**: Use RLS wrappers for centralized authorization (see `patterns/auth-authorization.md`).

📖 [Access control](https://docs.convex.dev/understanding/best-practices/#how-5)

---

### Preload Pattern `Official (ecosystem)`
Server prefetch → Client subscription. Zero waterfalls.

```typescript
// Server Component
export default async function TaskPage({ params }) {
  const { id } = await params;
  const preloaded = await preloadQuery(api.tasks.get, { id });
  return <TaskClient preloadedTask={preloaded} />;
}

// Client Component
"use client";
export function TaskClient({ preloadedTask }) {
  const task = usePreloadedQuery(preloadedTask);
  return <div>{task.title}</div>;
}
```

📖 [Full-stack fallacy](https://stack.convex.dev/full-stack-framework-fallacy#the-convex-take)

---

### Index Discipline `Convention`
Every `q.eq()` filter MUST have a corresponding index.

```typescript
// schema.ts
tasks: defineTable({ userId: v.id("users"), status: v.string() })
  .index("by_user", ["userId"])
  .index("by_user_status", ["userId", "status"])

// ✅ Uses index
ctx.db.query("tasks").withIndex("by_user_status", q => 
  q.eq("userId", userId).eq("status", "todo")
)

// ❌ Full table scan
ctx.db.query("tasks").filter(q => q.eq(q.field("userId"), userId))
```

---

### Next.js 15 Async Params `Framework`
`params` and `searchParams` are Promises in Next.js 15.

```typescript
// ✅ Correct
export default async function Page({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
}

// ❌ Incorrect (runtime error)
export default function Page({ params }: { params: { id: string } }) {
  const id = params.id;
}
```

---

## Pattern Files

| File | Content |
|------|---------|
| [`patterns/mutation-purity.md`](file://patterns/mutation-purity.md) | Determinism rules, Action orchestration |
| [`patterns/auth-authorization.md`](file://patterns/auth-authorization.md) | Guards, RLS, useConvexAuth, Clerk setup |
| [`patterns/actions-http.md`](file://patterns/actions-http.md) | Actions, HTTP actions, webhooks, sequential calls |
| [`patterns/preload-pattern.md`](file://patterns/preload-pattern.md) | Server prefetch + client subscription |
| [`patterns/function-best-practices.md`](file://patterns/function-best-practices.md) | Validation, helpers, await, internal functions |
| [`patterns/client-state.md`](file://patterns/client-state.md) | Lean on Convex's sync engine |
| [`patterns/eslint-rules.md`](file://patterns/eslint-rules.md) | Recommended Convex ESLint configuration |

## Convention Files

| File | Content |
|------|---------|
| [`conventions/index-discipline.md`](file://conventions/index-discipline.md) | Index requirements, N+1 prevention |
| [`conventions/error-contract.md`](file://conventions/error-contract.md) | Standardized error codes |
| [`conventions/folder-structure.md`](file://conventions/folder-structure.md) | "Convex Slice" architecture |
| [`conventions/ui-styling.md`](file://conventions/ui-styling.md) | shadcn/ui + Tailwind only |

## Anti-Patterns

See [`anti-patterns.md`](file://anti-patterns.md) for common mistakes to avoid.

---

## External Libraries

| Library | Use For |
|---------|---------|
| `convex-helpers` | Rate limiting, RLS, migrations, custom functions |
| `@clerk/nextjs` | Authentication provider |

📖 [convex-helpers on npm](https://www.npmjs.com/package/convex-helpers)
