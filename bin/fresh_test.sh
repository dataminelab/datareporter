echo "Stopping and removing the server container"
docker stop datareporter-server-1
docker rm datareporter-server-1
docker rmi datareporter-server
docker-comppose build
docker-compose up -d
docker-compose run --rm postgres psql -h postgres -U postgres -c "create database tests"
docker-compose run --rm server tests
# >> /python_tests.log 2>&1