import type { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types";

export type Commit =
  RestEndpointMethodTypes["repos"]["getCommit"]["response"]["data"];

export type Repository =
  RestEndpointMethodTypes["search"]["repos"]["response"]["data"]["items"][number];
