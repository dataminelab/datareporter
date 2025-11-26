# this is needed to debug plywood
# you can start the debuggger that way, then use the vscode launch config
# cd plywood/server
# npm run dev:debug

# before you might need to kill server and plywood containers

# Stop and remove the current server container
docker compose -f compose.dev.yml stop server
docker compose -f compose.dev.yml rm -f server

# Rebuild the server image
docker compose -f compose.dev.yml build server

# Start the server
docker compose -f compose.dev.yml up -d server

# Follow the logs
docker compose -f compose.dev.yml logs -f server