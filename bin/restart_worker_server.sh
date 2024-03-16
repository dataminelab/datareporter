echo "Restarting worker server without rebuilding the image"
docker stop datareporter-worker-server-1 && \
docker rm datareporter-worker-server-1 && \
docker rmi datareporter-worker-server-1
export skip_dev_deps="do not update dev dependencies"
export skip_ds_deps="do not update ds dependencies"
export skip_frontend_build="do not build front-end"
# only up worker server
docker-compose up -d
docker start datareporter-worker-server-1
docker logs datareporter-worker-server-1 --tail 500 -f
