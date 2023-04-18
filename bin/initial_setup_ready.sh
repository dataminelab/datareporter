docker rm datareporter-server-1
docker rm datareporter-postgres-1
docker-compose up -d
docker-compose run --rm server create_db
docker-compose run --rm postgres psql -h postgres -U postgres -c "create database tests"
docker-compose stop server && docker-compose run --rm --service-ports server debug && docker-compose start server
