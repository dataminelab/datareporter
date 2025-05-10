# check if we are in client folder, use dirname
if [ "$(basename $(pwd))" != "client" ]; then
  cd client
fi
if [ ! -d "node_modules" ]; then
  npm install
fi

npm run cypress build
npm run cypress start # also seeds the database

if [ "$1" = "run" ]; then
  npm run cypress run
else # if [ "$1" = "open" ]; then
  npm run cypress open
fi
