# Actions & HTTP Actions

> **Tag**: `Official (core)`

## When to Use Actions

Actions are for **external world interaction**. Prefer queries/mutations when possible.

| Use Case | Function Type |
|----------|---------------|
| Read from DB | `query` |
| Write to DB | `mutation` |
| Call Stripe/OpenAI/Resend | `action` |
| Receive webhooks | `httpAction` |
| Scheduled jobs with side effects | `action` (via `ctx.scheduler`) |

---

## Action Types

### User Actions (Browser-triggered)

```typescript
export const generateAI = action({
  args: { prompt: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) throw new ConvexError("Unauthorized");
    
    const result = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: args.prompt }],
    });
    
    // Store result via mutation
    await ctx.runMutation(api.ai.saveResult, {
      userId: user.subject,
      response: result.choices[0].message.content,
    });
    
    return result;
  },
});
```

### HTTP Actions (Webhooks)

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payload = await request.text();
    const sig = request.headers.get("stripe-signature");
    
    // 1. Validate signature FIRST
    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, sig!, endpointSecret);
    } catch (err) {
      return new Response("Invalid signature", { status: 400 });
    }
    
    // 2. Delegate to mutation (never process in HTTP action)
    switch (event.type) {
      case "payment_intent.succeeded":
        await ctx.runMutation(api.payments.handleSuccess, { 
          paymentIntent: event.data.object 
        });
        break;
      case "customer.subscription.updated":
        await ctx.runMutation(api.subscriptions.handleUpdate, {
          subscription: event.data.object
        });
        break;
    }
    
    return new Response(null, { status: 200 });
  }),
});

export default http;
```

### Internal/Scheduled Actions

```typescript
// Scheduled via mutation
export const scheduleReminder = mutation({
  args: { userId: v.id("users"), message: v.string(), delayMs: v.number() },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(args.delayMs, api.notifications.sendEmail, {
      userId: args.userId,
      message: args.message,
    });
  },
});

// The scheduled action
export const sendEmail = action({
  args: { userId: v.id("users"), message: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.get, { id: args.userId });
    await resend.emails.send({
      to: user.email,
      subject: "Reminder",
      text: args.message,
    });
  },
});
```

---

## Key Rules

1. **Validate webhooks before processing** — Signature check is line 1
2. **Delegate to mutations** — HTTP actions are thin edges
3. **Don't misuse actions** — If you don't need external calls, use mutation
4. **Actions can fail** — They're not automatically retried; handle errors

---

## Avoid Sequential `ctx.runQuery`/`ctx.runMutation` in Actions

Multiple sequential calls:
- Run in **separate transactions**
- May see **inconsistent state**
- Cost more function calls

```typescript
// ❌ BAD: Sequential calls = separate transactions
export const updateUserAndTasks = action({
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.get, { id: args.userId });
    await ctx.runMutation(api.users.update, { id: args.userId, name: args.name });
    await ctx.runMutation(api.tasks.reassign, { userId: args.userId });
    // Each call is a separate transaction!
  },
});

// ✅ GOOD: Single internal mutation does all DB work
export const updateUserAndTasks = action({
  handler: async (ctx, args) => {
    // External work here if needed...
    await ctx.runMutation(internal.users.updateWithTasks, args);
  },
});

// Internal mutation = single atomic transaction
export const updateWithTasks = internalMutation({
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    await ctx.db.patch(args.userId, { name: args.name });
    const tasks = await ctx.db.query("tasks").withIndex("by_user", q => q.eq("userId", args.userId)).collect();
    await Promise.all(tasks.map(t => ctx.db.patch(t._id, { updated: true })));
  },
});
```

📖 [Avoid sequential runMutation/runQuery](https://docs.convex.dev/understanding/best-practices/#avoid-sequential-ctxrunmutation--ctxrunquery-calls-from-actions)

---

## References

- [HTTP Actions](https://docs.convex.dev/functions/http-actions#defining-http-actions)
- [Actions Tutorial](https://docs.convex.dev/tutorial/actions#the-scheduler-actions-and-the-sync-engine)
- [Action Error Handling](https://docs.convex.dev/functions/actions#error-handling)
- [Actions Best Practices](https://docs.convex.dev/functions/actions#best-practices)
