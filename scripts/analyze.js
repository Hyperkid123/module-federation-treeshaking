/* eslint-disable @typescript-eslint/no-var-requires */
const concurrently = require("concurrently");
const folders = [
  "./broken-example/",
  "./broken-example-remote/",
  "./working-example/",
  "./working-example-remote/",
];
const path = require("path");

const { result } = concurrently(
  folders.map((folder) => `npm  --prefix ${folder} run analyze`),
  {
    prefix: "name",
    killOthers: ["failure", "success"],
    restartTries: 3,
    cwd: path.resolve(__dirname, "../"),
  }
);
result.then(
  () => {
    process.exit(0);
  },
  (err) => {
    console.log(err);
    process.exit(1);
  }
);
