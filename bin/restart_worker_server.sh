echo "Restarting worker server without rebuilding the image"
docker stop datareporter-worker-server-1 && \
docker rm datareporter-worker-server-1 && \
docker rmi datareporter-worker-server-1
export skip_dev_deps="do not update dev dependencies"
export skip_ds_deps="do not update ds dependencies"
export skip_frontend_build="do not build front-end"
docker-compose up -d
# only up worker server
docker start datareporter-worker-server-1
docker-compose stop worker-server && docker-compose run --rm --service-ports worker-server debug && docker-compose start worker-server
