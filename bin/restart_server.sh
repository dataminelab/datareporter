#!/bin/bash
if [ "$1" ]; then
    state="$1"
else
    state="no"
fi

if [ "$state" = "yes" ] || [ "$state" = "first" ]; then
    echo "Stopping and removing the server container"
    docker stop datareporter-server-1
    docker rm datareporter-server-1
    docker rmi datareporter-server
else
    echo "Restarting server without rebuilding the image"
    docker stop datareporter-server-1
    docker rm datareporter-server-1
    export skip_frontend_build="do not build front-end"
fi

docker compose -f compose.dev.yml up -d
docker compose -f compose.dev.yml run --rm server create_db
docker compose -f compose.dev.yml stop server && docker compose -f compose.dev.yml run --rm --service-ports server debug && docker compose -f compose.dev.yml start server