# ESLint Rules

> **Tag**: `Official (core)`

## Recommended Convex ESLint Rules

Install `@convex-dev/eslint-plugin`.

```javascript
// .eslintrc.js
module.exports = {
  plugins: ["@convex-dev"],
  rules: {
    "@convex-dev/no-old-registered-function-syntax": "error",
    "@convex-dev/require-argument-validators": "error",
    "@convex-dev/explicit-table-ids": "warn",
    "@convex-dev/no-collect-in-query": "warn",
  },
};
```

---

## Rule Descriptions

### `no-old-registered-function-syntax`

Prefer object syntax for function registration.

```typescript
// ❌ Old syntax
export const getUser = query(async (ctx, args) => { ... });

// ✅ New syntax
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => { ... },
});
```

---

### `require-argument-validators`

Require `args` validators on all public functions.

```typescript
// ❌ Missing args
export const createTask = mutation({
  handler: async (ctx, args) => { ... },
});

// ✅ Has args
export const createTask = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => { ... },
});
```

---

### `explicit-table-ids`

Use explicit table names in DB operations.

```typescript
// ⚠️ Implicit (works but less clear)
await ctx.db.get(args.id);

// ✅ Explicit
await ctx.db.get(args.id as Id<"tasks">);
```

---

### `no-collect-in-query`

Prefer `.take()` or `.paginate()` over `.collect()` in queries.

```typescript
// ⚠️ Unbounded collection
const all = await ctx.db.query("tasks").collect();

// ✅ Bounded
const first100 = await ctx.db.query("tasks").take(100);
const paginated = await ctx.db.query("tasks").paginate(opts);
```

---

## References

- [Convex ESLint Rules](https://docs.convex.dev/eslint#rules)
