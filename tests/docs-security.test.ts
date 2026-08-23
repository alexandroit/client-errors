import assert from "node:assert/strict";
import test from "node:test";

import { isGitHubPagesHostname } from "../docs-src/components/playground";

test("GitHub Pages mode requires the github.io registrable domain boundary", () => {
  assert.equal(isGitHubPagesHostname("github.io"), true);
  assert.equal(isGitHubPagesHostname("alexandroit.github.io"), true);
  assert.equal(isGitHubPagesHostname("ALEXANDROIT.GITHUB.IO"), true);
  assert.equal(isGitHubPagesHostname("evilgithub.io"), false);
  assert.equal(isGitHubPagesHostname("github.io.example.com"), false);
});
