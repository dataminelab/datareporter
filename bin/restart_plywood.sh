# this script restarts plywood with latest changes
# runs it on local on debug mode
cd client
npm run build:plywood
npm run build:plywood-server
cd ..
docker-compose stop plywood
docker-compose rm -f plywood
docker-compose up -d plywood -d
docker-compose stop plywood
cd plywood
npm run dev:debug
