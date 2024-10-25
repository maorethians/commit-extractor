import { Commit } from "./types";

export const filterByMessageLength = ({ commit }: Commit) =>
  commit.message.length > 500;
