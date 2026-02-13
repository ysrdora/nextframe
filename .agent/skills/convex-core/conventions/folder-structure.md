# Folder Structure ("Convex Slice")

> **Tag**: `Convention` (project-specific)

## The Rule

Strictly separate Backend (Convex) from Frontend (Next.js). Colocate by domain.

---

## Directory Layout

```
project/
├── convex/                     # Backend (Convex)
│   ├── _generated/             # Auto-generated types
│   ├── schema.ts               # Database schema (source of truth)
│   ├── http.ts                 # HTTP router for webhooks
│   ├── lib/                    # Shared utilities
│   │   ├── auth.ts             # Auth helpers
│   │   ├── errors.ts           # Error codes
│   │   └── rateLimit.ts        # Rate limiting
│   └── features/               # Domain-specific functions
│       ├── tasks/
│       │   ├── functions.ts    # Queries, mutations, actions
│       │   └── access.ts       # Authorization helpers
│       ├── users/
│       │   ├── functions.ts
│       │   └── access.ts
│       └── billing/
│           ├── functions.ts
│           └── webhooks.ts     # Stripe webhook handlers
│
├── src/                        # Frontend (Next.js)
│   ├── features/               # Domain-specific UI
│   │   ├── tasks/
│   │   │   ├── components/     # React components
│   │   │   ├── hooks/          # Custom hooks
│   │   │   └── types.ts        # Frontend-only types
│   │   └── users/
│   │       ├── components/
│   │       └── hooks/
│   ├── components/             # Shared UI components
│   └── lib/                    # Shared utilities
│
└── app/                        # Next.js App Router
    ├── (routes)/               # Route groups
    │   ├── dashboard/
    │   │   └── page.tsx        # Server component (preload)
    │   └── tasks/
    │       └── [id]/
    │           └── page.tsx
    └── layout.tsx
```

---

## Responsibility Matrix

| Layer | Location | Responsibility | Avoid |
|-------|----------|----------------|-------|
| Schema | `convex/schema.ts` | Database types, indexes, relationships | Runtime validation logic |
| Backend | `convex/features/*/functions.ts` | Queries, mutations, actions | Direct HTTP handling |
| UI Server | `app/(routes)/page.tsx` | URL parsing, auth prefetch, SEO | `useState`, `useEffect` |
| UI Client | `src/features/*/components` | Reactivity, interactions, optimistic UI | Direct Convex client instantiation |

---

## Colocation Rule

```
Domain: "invoicing"

Convex Side:
  convex/features/invoicing/
  ├── functions.ts    # createInvoice, getInvoice, listInvoices
  ├── access.ts       # canViewInvoice, canEditInvoice
  └── webhooks.ts     # handleStripeInvoicePaid

Next.js Side:
  src/features/invoicing/
  ├── components/
  │   ├── InvoiceList.tsx
  │   ├── InvoiceDetail.tsx
  │   └── InvoiceForm.tsx
  ├── hooks/
  │   └── useInvoice.ts
  └── types.ts
```

---

## Import Conventions

```typescript
// From Next.js, import Convex API
import { api } from "@/convex/_generated/api";

// From Convex, NEVER import Next.js code
// (Convex runs in its own runtime)

// Feature imports stay within their domain when possible
import { InvoiceList } from "@/features/invoicing/components/InvoiceList";
```

---

## Note

Convex only requires:
- A `convex/` folder
- `convex/http.ts` if using HTTP actions

The feature-based structure is a convention for larger projects.
