/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as availability from "../availability.js";
import type * as bookings from "../bookings.js";
import type * as http from "../http.js";
import type * as marketplace from "../marketplace.js";
import type * as memberships from "../memberships.js";
import type * as plans from "../plans.js";
import type * as recipes from "../recipes.js";
import type * as reviews from "../reviews.js";
import type * as trainerProfiles from "../trainerProfiles.js";
import type * as trainers from "../trainers.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  availability: typeof availability;
  bookings: typeof bookings;
  http: typeof http;
  marketplace: typeof marketplace;
  memberships: typeof memberships;
  plans: typeof plans;
  recipes: typeof recipes;
  reviews: typeof reviews;
  trainerProfiles: typeof trainerProfiles;
  trainers: typeof trainers;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
