/* eslint-disable import/no-extraneous-dependencies, no-console */
const { find } = require("lodash");
const { execSync } = require("child_process");
const axios = require("axios");
const { seedData } = require("./seed-data");
const fs = require("fs");

let cypressConfigBaseUrl;
try {
  const cypressConfig = JSON.parse(fs.readFileSync("cypress.json"));
  cypressConfigBaseUrl = cypressConfig.baseUrl;
} catch (e) {}

const baseUrl =
  process.env.CYPRESS_baseUrl ||
  cypressConfigBaseUrl ||
  "http://localhost:5000";

const cookieJar = {};

function parseCookies(setCookieHeaders) {
  if (!setCookieHeaders) return;
  const headers = Array.isArray(setCookieHeaders)
    ? setCookieHeaders
    : [setCookieHeaders];
  headers.forEach(header => {
    const parts = header.split(";")[0].split("=");
    const key = parts[0].trim();
    const value = parts.slice(1).join("=").trim();
    cookieJar[key] = value;
  });
}

function getCookieHeader() {
  return Object.entries(cookieJar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

async function seedDatabase(seedValues) {
  // GET /login to harvest CSRF cookie
  const loginRes = await axios.get(baseUrl + "/login", {
    maxRedirects: 5,
    validateStatus: () => true,
    headers: { Cookie: getCookieHeader() },
  });
  parseCookies(loginRes.headers["set-cookie"]);

  for (const request of seedValues) {
    const headers = { Cookie: getCookieHeader() };

    if (cookieJar["csrf_token"]) {
      if (request.type === "form") {
        request.data = { ...request.data, csrf_token: cookieJar["csrf_token"] };
      } else {
        headers["X-CSRFToken"] = cookieJar["csrf_token"];
      }
    }

    try {
      let res;
      if (request.type === "form") {
        const formData = new URLSearchParams(request.data);
        res = await axios.post(baseUrl + request.route, formData.toString(), {
          headers: {
            ...headers,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          validateStatus: () => true,
        });
      } else {
        res = await axios.post(baseUrl + request.route, request.data, {
          headers,
          validateStatus: () => true,
        });
      }
      parseCookies(res.headers["set-cookie"]);
      console.log("POST " + request.route + " - " + res.status);
    } catch (err) {
      console.log("POST " + request.route + " - " + err.message);
    }
  }
}

function buildServer() {
  console.log("Building the server...");
  execSync("docker compose -f ../.ci/compose.cypress.yml -p cypress build", {
    stdio: "inherit",
  });
}

function startServer() {
  console.log("Starting the server...");
  execSync("docker compose -f ../.ci/compose.cypress.yml -p cypress up -d", {
    stdio: "inherit",
  });
  execSync(
    "docker compose -f ../.ci/compose.cypress.yml -p cypress run server create_db",
    {
      stdio: "inherit",
    },
  );
}

function stopServer() {
  console.log("Stopping the server...");
  execSync("docker compose -f ../.ci/compose.cypress.yml -p cypress down", {
    stdio: "inherit",
  });
}

function runCypressCI() {
  const { CYPRESS_RECORD_KEY } = process.env;

  if (CYPRESS_RECORD_KEY) {
    process.env.CYPRESS_OPTIONS = "--record";
  }

  execSync(
    "COMMIT_INFO_MESSAGE=$(git show -s --format=%s) docker compose run --name cypress cypress ./node_modules/.bin/percy exec -t 300 -- ./node_modules/.bin/cypress run $CYPRESS_OPTIONS",
    { stdio: "inherit" },
  );
  execSync(
    "docker compose run --rm cypress ./node_modules/.bin/percy finalize --all",
    { stdio: "inherit" },
  );
}

const command = process.argv[2] || "all";

(async () => {
  switch (command) {
    case "build":
      buildServer();
      break;
    case "start":
      startServer();
      if (!process.argv.includes("--skip-db-seed")) {
        await seedDatabase(seedData);
      }
      break;
    case "db-seed":
      await seedDatabase(seedData);
      break;
    case "run":
      execSync("cypress run", { stdio: "inherit" });
      break;
    case "open":
      execSync("cypress open", { stdio: "inherit" });
      break;
    case "run-ci":
      runCypressCI();
      break;
    case "stop":
      stopServer();
      break;
    case "all":
      startServer();
      await seedDatabase(seedData);
      execSync("cypress run", { stdio: "inherit" });
      stopServer();
      break;
    default:
      console.log("Usage: npm run cypress [build|start|db-seed|open|run|stop]");
      break;
  }
})();
