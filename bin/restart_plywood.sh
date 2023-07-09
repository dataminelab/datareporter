cd client && npm run build:plywood && npm run build:plywood-server && cd ..
docker-compose stop plywood && docker-compose rm -f plywood && docker-compose up -d plywood && docker-compose logs -f plywood
