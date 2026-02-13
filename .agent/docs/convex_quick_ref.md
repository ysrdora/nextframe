# Convex + Next.js 15 Quick Reference

## Core Patterns

### Action → Mutation
```typescript
export const process = action({
  handler: async (ctx, args) => {
    const result = await externalAPI();
    await ctx.runMutation(internal.save, { ...result });
  },
});
```

### Auth Guard
```typescript
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new ConvexError("Unauthorized");
```

### Single Internal Mutation
```typescript
// ❌ await ctx.runMutation(...); await ctx.runMutation(...);
// ✅ await ctx.runMutation(internal.combined, args);
```

### Client Auth + Skip
```typescript
const { isAuthenticated } = useConvexAuth();
const user = useQuery(api.users.me, isAuthenticated ? {} : "skip");
```

### Preload Pattern
```typescript
// Server: await preloadQuery(api.tasks.get, { id })
// Client: usePreloadedQuery(preloadedTask)
```

### Next.js 15 Async Params
```typescript
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}
```

---

## Convex Auth Setup

```typescript
// convex/schema.ts
import { authTables } from "@convex-dev/auth/server";
export default defineSchema({ ...authTables, /* tables */ });

// app/ConvexClientProvider.tsx
<ConvexAuthNextjsProvider client={convex}>{children}</ConvexAuthNextjsProvider>

// Client hooks
const { signIn, signOut } = useAuthActions();
await signIn("password", { email, password });
```

---

## shadcn/ui Patterns

### Import Components
```typescript
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```

### Form with Convex
```typescript
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";

export function TaskForm() {
  const createTask = useMutation(api.tasks.create);
  const [title, setTitle] = useState("");

  return (
    <form onSubmit={(e) => { e.preventDefault(); createTask({ title }); }}>
      <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      <Button type="submit">Create</Button>
    </form>
  );
}
```

### Extend with cn()
```typescript
import { cn } from "@/lib/utils";
<Button className={cn("w-full", isLoading && "opacity-50")} />
```

### Rules
- Use components from `src/components/ui/`
- Tailwind CSS only — no CSS-in-JS
- No inline `style={{}}` (except dynamic values)

---

## Conventions

| Item | Rule |
|------|------|
| Indexes | Every `q.eq()` → index |
| Errors | `ConvexError` + `ErrorCodes` |
| UI | shadcn/ui + Tailwind |
| Structure | `convex/features/*` + `src/features/*` |

---

## Anti-Patterns

| ❌ Bad | ✅ Fix |
|--------|--------|
| `Date.now()` in mutation | Pass as arg |
| Action for DB work | Use query/mutation |
| Sequential `runMutation` | Single internal mutation |
| `.filter()` without index | Use `.withIndex()` |
| `params.id` (Next.js 15) | `await params` |

---

## Checklist

```
[ ] Mutations deterministic
[ ] Actions only for external I/O
[ ] Auth + args validators
[ ] All promises awaited
[ ] await params in Next.js 15
[ ] shadcn/ui + Tailwind only
```
