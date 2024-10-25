import { Commit } from "./types";

export const filterByAuthor = (commit: Commit) => commit.author?.type !== "Bot";
