#!/usr/bin/env node

const PJSON = "../dist/package.json";

const fs = require("fs");
const path = require("path");
const pJson = require(PJSON);

pJson.version = `${pJson.version}-build.${process.env.GITHUB_RUN_ATTEMPT || 0}${process.env.GITHUB_RUN_ID || ""}`;

delete pJson.jest;
delete pJson.babel;
delete pJson.scripts;
delete pJson.devDependencies;

fs.writeFileSync(path.join(__dirname, PJSON), JSON.stringify(pJson, null, 2), "utf8");
