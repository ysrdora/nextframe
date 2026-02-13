import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    frames: defineTable({
        dataUrl: v.string(),
        filename: v.string(),
        capturedAt: v.number(),
    }).index("by_capturedAt", ["capturedAt"]),
});
