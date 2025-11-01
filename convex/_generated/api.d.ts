/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth_utils from "../auth/utils.js";
import type * as auth from "../auth.js";
import type * as chatMessages from "../chatMessages.js";
import type * as chats from "../chats.js";
import type * as currentUser from "../currentUser.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as migration from "../migration.js";
import type * as todos from "../todos.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "auth/utils": typeof auth_utils;
  auth: typeof auth;
  chatMessages: typeof chatMessages;
  chats: typeof chats;
  currentUser: typeof currentUser;
  http: typeof http;
  messages: typeof messages;
  migration: typeof migration;
  todos: typeof todos;
  users: typeof users;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
