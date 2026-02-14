/* eslint-disable */
/**
 * Generated utilities for implementing server-side Convex query and mutation functions.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 * To regenerate, run `npx convex dev`.
 * @module
 */

import {
    actionGeneric,
    httpActionGeneric,
    queryGeneric,
    mutationGeneric,
    internalActionGeneric,
    internalMutationGeneric,
    internalQueryGeneric,
} from "convex/server";

import type { DataModelFromSchemaDefinition } from "convex/server";
import type schema from "../schema.js";

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;

export const query = queryGeneric as typeof queryGeneric;
export const mutation = mutationGeneric as typeof mutationGeneric;
export const action = actionGeneric as typeof actionGeneric;
export const httpAction = httpActionGeneric as typeof httpActionGeneric;
export const internalQuery = internalQueryGeneric as typeof internalQueryGeneric;
export const internalMutation = internalMutationGeneric as typeof internalMutationGeneric;
export const internalAction = internalActionGeneric as typeof internalActionGeneric;
