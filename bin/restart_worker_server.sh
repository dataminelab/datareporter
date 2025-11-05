#!/bin/bash
if [ "$1" ]; then
    state="$1"
else
    state="no"
fi

if [ "$state" = "yes" ] || [ "$state" = "first" ]; then
    echo "Stopping and removing the worker server container"
    docker stop datareporter-worker-server-1
    docker rm datareporter-worker-server-1
    docker rmi datareporter-worker-server
else
    echo "Restarting worker server without rebuilding the image"
    docker stop datareporter-worker-server-1
    docker rm datareporter-worker-server-1
    export skip_dev_deps="do not update dev dependencies"
    export skip_ds_deps="do not update ds dependencies"
    export skip_frontend_build="do not build front-end"
fi

docker compose -f docker-compose.yml up -d
docker compose -f docker-compose.yml stop worker-server && docker compose -f docker-compose.yml run --rm --service-ports worker-server debug && docker compose -f docker-compose.yml start worker-server