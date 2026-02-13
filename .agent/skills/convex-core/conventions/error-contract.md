# Error Contract

> **Tag**: `Convention` (project-specific)

## Standardized Error Codes

```typescript
// convex/lib/errors.ts
export const ErrorCodes = {
  UNAUTHORIZED: { code: "UNAUTHORIZED", status: 401 },
  FORBIDDEN: { code: "FORBIDDEN", status: 403 },
  NOT_FOUND: { code: "NOT_FOUND", status: 404 },
  VALIDATION: { code: "VALIDATION", status: 400 },
  RATE_LIMITED: { code: "RATE_LIMITED", status: 429 },
  CONFLICT: { code: "CONFLICT", status: 409 },
} as const;

export type ErrorCode = keyof typeof ErrorCodes;
```

---

## Usage in Functions

```typescript
import { ConvexError } from "convex/values";
import { ErrorCodes } from "./lib/errors";

export const updateTask = mutation({
  args: { taskId: v.id("tasks"), title: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError({ code: ErrorCodes.UNAUTHORIZED.code });
    }
    
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new ConvexError({ code: ErrorCodes.NOT_FOUND.code });
    }
    
    if (task.userId !== identity.subject) {
      throw new ConvexError({ code: ErrorCodes.FORBIDDEN.code });
    }
    
    await ctx.db.patch(args.taskId, { title: args.title });
  },
});
```

---

## Client-Side Handling

```typescript
// src/lib/errors.ts
import { toast } from "sonner";

export function handleConvexError(error: unknown) {
  const code = (error as any)?.data?.code;
  
  switch (code) {
    case "UNAUTHORIZED":
      window.location.href = "/login";
      break;
    case "FORBIDDEN":
      toast.error("You don't have permission to do this");
      break;
    case "NOT_FOUND":
      toast.error("Resource not found");
      break;
    case "RATE_LIMITED":
      toast.error("Slow down! Try again in a moment");
      break;
    case "VALIDATION":
      toast.error("Invalid input");
      break;
    default:
      toast.error("Something went wrong");
      console.error(error);
  }
}

// Usage in component
const updateTask = useMutation(api.tasks.update);

const handleSubmit = async (data: FormData) => {
  try {
    await updateTask({ taskId, title: data.title });
  } catch (error) {
    handleConvexError(error);
  }
};
```

---

## With Details

```typescript
// Include additional context
throw new ConvexError({ 
  code: ErrorCodes.VALIDATION.code,
  details: { field: "email", message: "Invalid email format" }
});

// Client can extract details
const details = (error as any)?.data?.details;
if (details?.field) {
  form.setError(details.field, { message: details.message });
}
```

---

## Note

Convex has a built-in `ConvexError` class from `convex/values`. This convention builds on top of it with standardized codes for consistent client handling.
