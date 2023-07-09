cd client && npm run build:plywood && cd ..
docker-compose stop plywood && docker-compose rm -f plywood && docker-compose up -d plywood && docker-compose logs -f plywood
