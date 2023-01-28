docker rm datareporter-server-1
docker rm datareporter-postgres-1
#docker rmi 86fc59aa66106bc44f1273de15547927ad631326072e912b5bfaefe77a8180d4
#docker rmi 5f6a432c9fab055caa2bb03e23db355add07c1b00adecbb957516591aa090ecd
docker-compose up -d
docker-compose run --rm server create_db
docker-compose run --rm postgres psql -h postgres -U postgres -c "create database tests"
docker-compose stop server && docker-compose run --rm --service-ports server debug && docker-compose start server
