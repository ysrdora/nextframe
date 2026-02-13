# UI Styling

> **Tag**: `Convention` (project-specific)

## The Rules

1. **Use shadcn/ui components** from `src/components/ui`
2. **Use Tailwind CSS exclusively** for styling
3. **No CSS-in-JS** (Styled Components, Emotion, etc.)
4. **UI Components (shadcn-ui)**
   - Use shadcn-ui for UI Components
   - Prefer shadcn-ui components for building user interfaces.
   - Follow shadcn-ui best practices for component usage and theming.
   - When customizing components, adhere to shadcn-ui conventions and keep code modular and maintainable.
5. **UI/Styling: shadcn/ui + Tailwind CSS**

---

## Component Usage

```typescript
// ✅ GOOD: Import from shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function TaskForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Task title" className="mb-4" />
        <Button>Create</Button>
      </CardContent>
    </Card>
  );
}

// ❌ BAD: Custom styled components
import styled from "styled-components";
const StyledButton = styled.button`...`;
```

---

## Tailwind Patterns

```typescript
// ✅ GOOD: Tailwind classes
<div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
  <span className="text-sm font-medium text-muted-foreground">
    {task.title}
  </span>
</div>

// ❌ BAD: Inline styles
<div style={{ display: "flex", padding: "16px" }}>

// ❌ BAD: CSS-in-JS
const styles = css`display: flex;`;
```

---

## Extending shadcn/ui

When customizing components, use Tailwind's `cn()` utility:

```typescript
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Props extends React.ComponentProps<typeof Button> {
  isLoading?: boolean;
}

export function LoadingButton({ isLoading, className, children, ...props }: Props) {
  return (
    <Button 
      className={cn("relative", isLoading && "opacity-50", className)} 
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Spinner className="absolute" />}
      {children}
    </Button>
  );
}
```

---

## Verification Checklist

- [ ] All UI components come from `src/components/ui` or extend them
- [ ] No `styled-components`, `@emotion`, or similar imports
- [ ] No `style={{}}` inline styles (except dynamic values like `style={{ width: `${percent}%` }}`)
- [ ] All custom styling uses Tailwind classes
