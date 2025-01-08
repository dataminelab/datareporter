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
    docker-compose up -d
    docker compose run --rm server create_db
    docker-compose stop server && docker-compose run --rm --service-ports server debug && docker-compose start server

else

    echo "Restarting server without rebuilding the image"
    docker stop datareporter-server-1
    docker rm datareporter-server-1

    export skip_frontend_build="do not build front-end"
    docker-compose up -d
    docker-compose stop server && docker-compose run --rm --service-ports server debug && docker-compose start server

fi
