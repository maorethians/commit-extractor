import { Repository } from "./types";

const blacklist = [
  "hello-algo",
  "java-design-patterns",
  "Java",
  "Stirling-PDF",
  "dubbo",
  "tutorials",
  "ruoyi-vue-pro",
  "shardingsphere",
];

export const filterByProject = (repo: Repository) =>
  !blacklist.includes(repo.name);
