# Client State Management

> **Tag**: `Official (core)`

## The Rule

Don't over-complicate client-side state. **Lean on Convex's sync engine.**

---

## Prefer Convex Queries Over Custom Caches

```typescript
// ❌ BAD: Custom cache duplicating Convex
const [tasks, setTasks] = useState<Task[]>([]);

useEffect(() => {
  fetchTasks().then(setTasks);
}, []);

// Manually refetch on changes
const handleCreate = async () => {
  await createTask({ title });
  const updated = await fetchTasks(); // Manual refetch
  setTasks(updated);
};
```

```typescript
// ✅ GOOD: Let Convex handle reactivity
const tasks = useQuery(api.tasks.list);
const createTask = useMutation(api.tasks.create);

// Automatic reactivity - no manual refetch needed
const handleCreate = async () => {
  await createTask({ title });
  // `tasks` automatically updates via subscription
};
```

---

## State Categories

| State Type | Where to Store | Example |
|-----------|----------------|---------|
| Server data | Convex (`useQuery`) | Tasks, users, comments |
| UI state | React (`useState`) | Modal open, form values |
| URL state | Next.js router | Filters, pagination |
| Auth state | Clerk/Auth provider | User identity |

---

## When useState is Appropriate

```typescript
// ✅ Form input (ephemeral UI state)
const [title, setTitle] = useState("");

// ✅ Modal visibility (local UI state)
const [isOpen, setIsOpen] = useState(false);

// ✅ Optimistic updates (temporary display)
const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);
```

---

## Avoid

- React Query/SWR for Convex data (Convex already handles caching)
- Redux/Zustand for server state (use Convex queries)
- Manual polling (Convex is real-time)
- `unstable_cache` on Convex data

📖 [Zen: Performance](https://docs.convex.dev/understanding/zen#performance)
