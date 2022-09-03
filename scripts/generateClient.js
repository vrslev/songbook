const { exec } = require("child_process");
const OpenAPI = require("openapi-typescript-codegen");

function execOrFail(command, callback) {
  exec(command, (error, stdout, stderr) => {
    if (error) return console.log(error.message);
    if (stderr) return console.log(stderr);
    if (callback) callback(stdout);
  });
}

function getSpec(callback) {
  execOrFail(
    ".venv/bin/python -c 'import json; from backend.app.main import app; print(json.dumps(app.openapi()))'",
    callback
  );
}

function generateClient(input, outputPath) {
  OpenAPI.generate({
    input: input,
    output: outputPath,
    clientName: "Client",
    httpClient: "axios",
    postfix: "ImplAPI",
  });
}

function formatDir(path) {
  execOrFail(`npx prettier --write --list-different --ignore-unknown ${path}`);
}

function main() {
  getSpec((stdout) => {
    const outputPath = "./frontend/client";
    generateClient(JSON.parse(stdout), outputPath);
    formatDir(outputPath);
  });
}

main();
