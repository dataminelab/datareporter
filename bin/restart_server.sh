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
    docker compose -f docker-compose.yml up -d
else
    echo "Restarting server without rebuilding the image"
    docker stop datareporter-server-1
    docker rm datareporter-server-1
    export skip_frontend_build="do not build front-end"
    docker compose -f docker-compose.yml up -d
fi

docker compose -f docker-compose.yml run --rm server create_db
docker compose -f docker-compose.yml stop server && docker compose -f docker-compose.yml run --rm --service-ports server debug && docker compose -f docker-compose.yml start server