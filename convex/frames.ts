import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const saveFrame = mutation({
    args: {
        dataUrl: v.string(),
        filename: v.string(),
        capturedAt: v.number(),
    },
    handler: async (ctx, args) => {
        const frameId = await ctx.db.insert("frames", {
            dataUrl: args.dataUrl,
            filename: args.filename,
            capturedAt: args.capturedAt,
        });
        return frameId;
    },
});

export const getFrames = query({
    args: {},
    handler: async (ctx) => {
        const frames = await ctx.db
            .query("frames")
            .withIndex("by_capturedAt")
            .order("desc")
            .collect();
        return frames;
    },
});

export const deleteFrame = mutation({
    args: {
        frameId: v.id("frames"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.frameId);
    },
});
