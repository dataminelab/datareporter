# check if we are in client folder, use dirname
if [ "$(basename $(pwd))" != "client" ]; then
  cd client
fi
if [ ! -d "node_modules" ]; then
  npm install
fi
npm run cypress build
npm run cypress start
npm run cypress open
