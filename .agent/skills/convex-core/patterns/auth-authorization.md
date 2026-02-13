# Auth + Authorization

> **Tag**: `Official (core)` + `Official (ecosystem)`

## Convex Auth Setup

### Schema with Auth Tables
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  // Your tables
  tasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
  }).index("by_user", ["userId"]),
});
```

### Auth Config
```typescript
// convex/auth.config.ts
export default {
  providers: [
    // Configure your providers
  ],
};
```

### Auth Module
```typescript
// convex/auth.ts
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [/* your providers */],
});
```

---

## Next.js Provider

```typescript
// app/ConvexClientProvider.tsx
"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      {children}
    </ConvexAuthNextjsProvider>
  );
}
```

---

## Client-Side Auth

### Auth State
```typescript
import { useConvexAuth } from "convex/react";

const { isLoading, isAuthenticated } = useConvexAuth();
```

### Sign In/Out
```typescript
import { useAuthActions } from "@convex-dev/auth/react";

const { signIn, signOut } = useAuthActions();

// Password auth
await signIn("password", { email, password, flow: "signIn" });

// Sign out
await signOut();
```

### Skip Pattern
```typescript
const user = useQuery(api.users.me, isAuthenticated ? {} : "skip");
```

---

## Server-Side Auth Guard

```typescript
export const updateTask = mutation({
  args: { taskId: v.id("tasks"), title: v.string() },
  handler: async (ctx, args) => {
    // 1. Authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Unauthorized");
    
    // 2. Authorization
    const task = await ctx.db.get(args.taskId);
    if (task?.userId !== identity.subject) throw new ConvexError("Forbidden");
    
    await ctx.db.patch(args.taskId, { title: args.title });
  },
});
```

---

## References

- [Convex Auth Overview](https://docs.convex.dev/auth/convex-auth)
- [Convex Auth Setup](https://labs.convex.dev/auth/setup)
- [ConvexAuthNextjsProvider](https://labs.convex.dev/auth/api_reference/nextjs)
