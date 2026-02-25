#!/usr/bin/env node

const { runCli } = require("../dist/index.js");

runCli(process.argv).catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});
