docker stop datareporter-server-1
docker rm datareporter-server-1
#docker rmi datareporter-server
export skip_dev_deps="do not update dev dependencies"
export skip_ds_deps="do not update ds dependencies"
export skip_frontend_build="do not build front-end"
docker-compose up -d
docker-compose stop server && docker-compose run --rm --service-ports server debug && docker-compose start server
