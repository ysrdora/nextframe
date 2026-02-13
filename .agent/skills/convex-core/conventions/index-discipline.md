# Index Discipline

> **Tag**: `Official (core)` for `.filter()` avoidance, `Convention` for index-per-eq rule

## The Rule

1. **Avoid `.filter()` on DB queries** — Use `.withIndex()` or filter small results in TypeScript. `Official`
2. **Every `q.eq()` filter should have a corresponding index** — For performance. `Convention`

---

## Schema Definition

```typescript
// convex/schema.ts
export default defineSchema({
  tasks: defineTable({
    userId: v.id("users"),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    priority: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_priority", ["priority"]),
});
```

---

## Query Patterns

### ✅ Correct: Uses Index

```typescript
// Uses "by_user_status" index
const tasks = await ctx.db
  .query("tasks")
  .withIndex("by_user_status", (q) => 
    q.eq("userId", userId).eq("status", "todo")
  )
  .order("desc")
  .take(100);
```

### ❌ Incorrect: Full Table Scan

```typescript
// Scans entire table, then filters in memory
const allTasks = await ctx.db.query("tasks").collect();
const userTasks = allTasks.filter(t => t.userId === userId);

// Also bad: filter() without index
const tasks = await ctx.db
  .query("tasks")
  .filter((q) => q.eq(q.field("userId"), userId))
  .collect();
```

---

## N+1 Prevention

### ❌ Bad: Loop with Individual Gets

```typescript
// N+1 problem: one query per user
const users = await Promise.all(
  task.assigneeIds.map(id => ctx.db.get(id))
);
```

### ✅ Better: Batch Get (when IDs known)

```typescript
// Single pass through known IDs
const users = await Promise.all(
  task.assigneeIds.map(id => ctx.db.get(id))
);
// This is acceptable for small N (< 50 items)
```

### ✅ Best: Single Query with Index

```typescript
// When filtering by a field, use an index
const teamMembers = await ctx.db
  .query("users")
  .withIndex("by_team", (q) => q.eq("teamId", teamId))
  .collect();
```

---

## Index Design Guidelines

1. **Prefix Rule**: Indexes work left-to-right. `["userId", "status"]` supports:
   - `q.eq("userId", x)` ✅
   - `q.eq("userId", x).eq("status", y)` ✅
   - `q.eq("status", y)` ❌ (needs separate index)

2. **Sorting**: Add sort field as last index column
   ```typescript
   .index("by_user_created", ["userId", "createdAt"])
   // Supports: where userId = ? order by createdAt
   ```

3. **Compound Indexes**: Create based on actual query patterns
   ```typescript
   // If you query: where userId = ? and status = ? order by priority
   .index("by_user_status_priority", ["userId", "status", "priority"])
   ```

---

## Verification Checklist

- [ ] Every `withIndex` call uses an existing index name
- [ ] Every `q.eq()` field is covered by the index prefix
- [ ] No `.filter()` calls without an index (full scan)
- [ ] No post-query filtering in JavaScript
