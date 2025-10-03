docker compose build
docker compose up -d
docker compose run --rm postgres psql -h postgres -U postgres -c "create database tests" # make sure tests database is created:
docker compose run --rm server tests