# Preload Pattern

> **Tag**: `Official (ecosystem)` + `Framework (Next.js)`

## The Concept

Separate **Initial Fetch** (Server) from **Subscription** (Client) for zero waterfalls.

```
┌─────────────────┐    preloadQuery    ┌─────────────────┐
│  Server Comp    │ ──────────────────▶│     Convex      │
│  (SSR/RSC)      │                    │     Backend     │
└────────┬────────┘                    └────────┬────────┘
         │                                      │
         │ preloaded                            │
         ▼                                      │
┌─────────────────┐  usePreloadedQuery │        │
│  Client Comp    │ ◀──────────────────┼────────┘
│  (Hydrated)     │    (subscribes)    │
└─────────────────┘                    │
         │                             │
         │  useMutation                │
         └─────────────────────────────┘
```

---

## Implementation

### Server Component (Route)

```typescript
// app/tasks/[id]/page.tsx
import { preloadQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { TaskClient } from "@/features/tasks/components/TaskClient";

export default async function TaskPage({ 
  params 
}: { 
  params: Promise<{ id: string }> // Next.js 15: params is a Promise
}) {
  const { id } = await params;
  
  // Prefetch for instant paint (no loading state on client)
  const preloadedTask = await preloadQuery(api.tasks.get, { id });
  
  return <TaskClient preloadedTask={preloadedTask} />;
}
```

### Client Component

```typescript
// src/features/tasks/components/TaskClient.tsx
"use client";

import { usePreloadedQuery, useMutation } from "convex/react";
import { Preloaded } from "convex/react";
import { api } from "@/convex/_generated/api";

interface Props {
  preloadedTask: Preloaded<typeof api.tasks.get>;
}

export function TaskClient({ preloadedTask }: Props) {
  // Subscribe to real-time updates with zero latency
  const task = usePreloadedQuery(preloadedTask);
  
  // Optimistic mutations
  const updateTask = useMutation(api.tasks.update);
  
  const handleUpdate = async (data: { title: string }) => {
    await updateTask({ id: task._id, ...data });
  };
  
  return (
    <div>
      <h1>{task.title}</h1>
      <TaskForm task={task} onSubmit={handleUpdate} />
    </div>
  );
}
```

---

## Next.js 15: Async Params

> **Tag**: `Framework (Next.js)`

In Next.js 15, `params` and `searchParams` are Promises.

```typescript
// ✅ Correct (Next.js 15)
export default async function Page({ 
  params,
  searchParams,
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { id } = await params;
  const { filter } = await searchParams;
  // ...
}

// ❌ Incorrect (will fail at runtime)
export default function Page({ params }: { params: { id: string } }) {
  const id = params.id; // Runtime error!
}
```

---

## Multiple Queries

Use `Promise.all` for parallel prefetching:

```typescript
export default async function DashboardPage() {
  const [preloadedUser, preloadedStats, preloadedTasks] = await Promise.all([
    preloadQuery(api.users.current, {}),
    preloadQuery(api.stats.dashboard, {}),
    preloadQuery(api.tasks.list, { limit: 10 }),
  ]);
  
  return (
    <DashboardClient 
      preloadedUser={preloadedUser}
      preloadedStats={preloadedStats}
      preloadedTasks={preloadedTasks}
    />
  );
}
```

---

## References

- [Full-Stack Fallacy](https://stack.convex.dev/full-stack-framework-fallacy#the-convex-take)
- [End-to-End TypeScript](https://stack.convex.dev/end-to-end-ts#putting-it-all-together)
