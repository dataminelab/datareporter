docker stop datareporter-server-1
docker rm datareporter-server-1
docker rmi datareporter-server
docker-compose up -d
docker-compose stop server && docker-compose run --rm --service-ports server debug && docker-compose start server
