import { Octokit } from "octokit";
import XLSX from "xlsx";

interface OutputCommit {
  repoUrl: string;
  url: string;
  message: string;
}

const octokit = new Octokit({
  auth: "",
});

const extract = async () => {
  const { data: res } = await octokit.rest.search.repos({
    q: "language:java",
    sort: "stars",
    order: "desc",
    per_page: 100,
  });
  const repos = res.items;

  const output: OutputCommit[] = [];
  for (const repo of repos) {
    const { data: commits } = await octokit.rest.repos.listCommits({
      repo: repo.name,
      owner: repo.owner?.login,
      per_page: 100,
    });

    for (const commit of commits) {
      const { message } = commit.commit;
      if (message.length > 500) {
        output.push({
          repoUrl: repo.html_url,
          url: commit.html_url,
          message,
        });
      }
    }
    console.log(`${repo.name} extracted`);
  }

  // TODO: filter by the number of java files in the commit
  return output;
};

const storeExcel = async (commits: OutputCommit[]) => {
  const data: string[][] = [];

  const keys = Object.keys(commits[0]);
  data.push(keys);

  for (const commit of commits) {
    const row: string[] = [];

    for (const key of keys) {
      row.push(commit[key as keyof OutputCommit]);
    }

    data.push(row);
  }

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, "output.xlsx");
};

extract().then((res) => storeExcel(res));
