
# First lets ensure that the "tests" database is created:
docker-compose run --rm postgres psql -h postgres -U postgres -c "create database tests"

# Then run the tests:
docker-compose run --rm server tests