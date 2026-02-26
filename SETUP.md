# Dev Environment

Setup guide for DataReporter's development environment.

## Prerequisites

### Node.js 18.20

DataReporter builds correctly with Node version 18.20. Use [nodenv](https://joshmorel.ca/post/node-virtual-environments-with-nodenv/) or nvm:

- [Ensure shims are added to PATH](https://github.com/nodenv/nodenv#how-it-works)
- [For Windows WSL2 with nvm](https://learn.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-wsl)

**Using nodenv:**

```sh
nodenv install 18.20
nodenv local 18.20
```

**Using nvm:**

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
nvm install v18.20
nvm alias default v18.20
```

To auto-select the Node version on new terminals, add to `.bashrc` or `.bash_profile`:

```sh
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use v18.20 > /dev/null
```

### Python 3.10 and dependencies

```sh
sudo apt install -y python3.10 python3.10-venv python3.10-dev
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1
python3.10 --version
curl -sSL https://install.python-poetry.org | POETRY_VERSION=2.1.1 python3 -
poetry --version
POETRY_OPTIONS="--no-root --no-interaction --no-ansi"
install_groups="main,all_ds,dev"
poetry install --only $install_groups $POETRY_OPTIONS
```

## Environment Setup

Set up environment variables before starting Docker services. Copy the example file and adjust values for your local setup:

```sh
cp .env.example .env
# Edit .env to set your configuration
```

For reference, see `.env.example` in the project root for sample variables and expected formats.

## Docker Compose Setup

Start the backend services (postgres, redis, server, plywood):

```sh
docker compose up --build
```

Initialize the database (first time only):

```sh
docker compose run --rm server create_db
```

Database migration commands:

```sh
# If you get "target database is not up to date":
docker compose run server manage db stamp head
# Create migration after backend model changes:
docker compose run server manage db migrate
# Apply pending migrations:
docker compose run --rm server manage db upgrade
```

## Frontend Development

There are two ways to develop the frontend. **Option 1 is recommended** for day-to-day work.

### Option 1: Hot-reload with webpack-dev-server (recommended)

Runs a local dev server with hot module replacement. Changes appear instantly in the browser without rebuilding.

**Terminal 1 — Backend (Docker):**

```sh
docker compose up
```

**Terminal 2 — Frontend (host):**

```sh
cd client
npm install   # first time only
npm run start
```

Open **`http://localhost:8080`** in your browser. The webpack-dev-server proxies API calls (`/api`, `/login`, `/plywood`, etc.) to the Docker backend at `localhost:5000` and plywood at `localhost:3000`. Edit client code, save, and see changes immediately.

| Command | What it does |
|---------|-------------|
| `npm run start` | webpack-dev-server + viz-lib watcher — hot reload at port 8080 |
| `npm run watch` | Rebuilds `client/dist/` on file change — Docker serves updates at port 5000 (slower) |
| `npm run dev` | Same as `start` with `--openssl-legacy-provider` for older Node compatibility |

### Linux: file watcher limit

On Linux you may hit the inotify watcher limit:

```
Error: ENOSPC: System limit for number of file watchers reached, watch
```

Fix:

```sh
sudo sysctl -w fs.inotify.max_user_watches=512000
```

## Architecture

### Ports

| Service | Port | Purpose |
|---------|------|---------|
| webpack-dev-server | 8080 | Frontend dev with hot reload (host only, not Docker) |
| server | 5000 | Python backend API + serves production `client/dist/` |
| plywood | 3000 | Plywood/Turnilo OLAP server |
| postgres | 5432, 15432 | Database |
| redis | 6379 | Cache and job queue |
| email (maildev) | 1080, 1025 | Local email testing UI and SMTP |
| server debug | 5678 | Python debugger |
| plywood debug | 9231 | Node.js debugger |

### Components

#### Backend (Python)

- **Directory:** `redash`
- **Debug:** Follow the [debugging guide](/docs/open-source/dev-guide/debugging/)
- **Changes:** Immediately visible — Python runs directly from source via the bind mount.

#### Frontend (JavaScript)

- **Directories:** `client`, `viz-lib`, `plywood/client`
- **Debug:** Open `http://localhost:8080` (dev server) or `http://localhost:5000` (Docker) and use browser devtools.
- **Changes:** Use `npm run start` in `client/` for hot reload, or `npm run watch` to rebuild `dist/` on change.

#### Plywood server (Node.js)

- **Directory:** `plywood`
- **Debug:** Connect Node.js debugger to `localhost:9231`
- **Changes:** Automatically reflected — runs in watch mode with incremental builds.
- **Logs:** `docker compose logs plywood`

### Supported Report Engines

postgres, mysql, bigquery, athena, druid, pg, json

## Testing

### Backend

```sh
# Create test database (first time only):
docker compose run --rm postgres psql -h postgres -U postgres -c "create database tests"
# Run all tests:
docker compose run --rm server tests
# Run tests for a specific module:
docker compose run --rm server pytest -v tests/plywood/test_json.py
```

### viz-lib

```sh
cd viz-lib
npm run test
```

### End-to-end (Cypress)

```sh
cd client
npm run cypress db-seed  # Seed database with test data
npm run cypress run       # Run Cypress tests in headless mode
```

## Debugging

### Python backend (VS Code)

Follow the [debugging guide](/docs/open-source/dev-guide/debugging/), then:

```sh
pip install ptvsd
docker compose stop server && docker compose run --rm --service-ports server debug && docker compose start server
```

### Plywood logs

Set log mode in `docker-compose.yml` environment or override:

- `LOG_MODE=request_and_response` — full request/response logging
- `LOG_MODE=response_only` — responses only

### Ollama (local AI)

If using the Ollama service for local AI, download the model first:

```sh
docker compose exec ollama ollama pull deepseek-r1:7b
```

### Alternative Docker Compose config

To use the dev-specific compose override:

```sh
docker compose -f compose.dev.yml up -d
```

## Troubleshooting

### Docker build issues

If you have issues building Docker images, try removing the Docker config:

```bash
rm ~/.docker/config.json
```

### Docker container networking

Useful when testing connections between containers (e.g., connecting to a router container from DataReporter):

```bash
docker network connect datareporter_default router
docker inspect -f '{{range $key, $value := .NetworkSettings.Networks}}{{$key}} {{end}}' router
docker inspect -f '{{range $key, $value := .NetworkSettings.Networks}}{{$key}} {{end}}' datareporter-server-1
docker exec datareporter-server-1 ping router -c2
```

## Reference

### Python environment with pyenv

For local Python development outside Docker:

```sh
pyenv install 3.10
pyenv local 3.10
pyenv virtualenv 3.10 .venv
source ./.venv/bin/activate
```

See [pyenv installation](https://github.com/pyenv/pyenv#installation) for setup instructions.

### Python package management (Poetry)

Backend uses [Poetry](https://python-poetry.org/) for dependency management:

```sh
# Install poetry
pip3 install poetry==2.1.1

# Add a new package
poetry add <package-name>

# Remove a package
poetry remove <package-name>
```
