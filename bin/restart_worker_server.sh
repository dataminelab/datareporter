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

docker compose -f compose.dev.yml up -d
docker compose -f compose.dev.yml stop worker-server && docker compose -f compose.dev.yml run --rm --use-aliases -p 5001:5000 -p 5679:5678 worker-server dev_worker_server && docker compose -f compose.dev.yml start worker-server