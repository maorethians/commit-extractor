import { Octokit } from "octokit";
import { filterByAuthor } from "./filters/filterByAuthor";
import { filterByProject } from "./filters/filterByProject";
import { Repository } from "./filters/types";
import { modelTrainingCutOffs } from "./modelTrainingCutOffs";
import fs from "node:fs";
import { hasJavaChange } from "./filters/hasJavaChange";
import { filterByMessageContent } from "./filters/filterByMessageContent";

interface OutputCommit {
  owner: string;
  repo: string;
  sha: string;
  url: string;
  message: string;
  refinedMessage?: string;
}

let store: {
  visitedRepos: string[];
  commits: Record<string, OutputCommit | null>;
} = { visitedRepos: [], commits: {} };

const octokit = new Octokit({
  auth: "",
});

const extract = async () => {
  const storeStr = fs.readFileSync("./src/store.json", "utf8");
  if (storeStr) {
    store = JSON.parse(storeStr);
  }

  let reposPageIndex = 1;
  while (true) {
    const { data: res } = await octokit.rest.search.repos({
      q: "language:java",
      sort: "stars",
      order: "desc",
      per_page: 50,
      page: reposPageIndex++,
    });
    const repos = res.items as Repository[];

    const validRepos = repos
      .filter(filterByProject)
      .filter((repo) => !store.visitedRepos.includes(repo.name));
    for (const repo of validRepos) {
      let commitsPageIndex = 1;
      while (true) {
        const { data: commits } = await octokit.rest.repos.listCommits({
          repo: repo.name,
          owner: repo.owner!.login,
          //   since: modelTrainingCutOffs["qwen2.5-coder"],
          per_page: 100,
          page: commitsPageIndex++,
        });
        if (commits.length === 0) {
          break;
        }

        const validCommits = commits
          // .filter(filterByMessageLength)
          .filter(filterByAuthor)
          .filter((commit) =>
            filterByMessageContent(commit, (message) => message.includes("fix"))
          )
          .filter((commit) => !store.commits[commit.sha]);
        for (const commit of validCommits) {
          const { data: commitDetail } = await octokit.rest.repos.getCommit({
            repo: repo.name,
            owner: repo.owner!.login,
            ref: commit.sha,
          });

          if (hasJavaChange(commitDetail)) {
            store.commits[commit.sha] = {
              owner: repo.owner!.login,
              repo: repo.name,
              sha: commit.sha,
              url: commit.html_url,
              message: commit.message,
            };
          }
        }
      }

      store.visitedRepos.push(repo.name);

      fs.writeFileSync("./src/store.json", JSON.stringify(store));

      console.log(repo.name, Object.keys(store.commits).length);
    }
  }
};

extract();
