import { Commit } from "./types";

export const filterByMessageContent = (
  { commit }: Commit,
  rule: (content: string) => boolean
) => rule(commit.message);
