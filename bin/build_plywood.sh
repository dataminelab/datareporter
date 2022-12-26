#!/bin/sh
set -e
echo "Build plywood client "
cd plywood/server/client
npm i || ( cat /root/.npm/_logs/* && exit 1)
npm run compile || ( cat /root/.npm/_logs/* && exit 1)
cd -

echo "Build plywood client "
cd plywood/server

npm ci  || ( cat /root/.npm/_logs/* && exit 1)
npm run build || ( cat /root/.npm/_logs/* && exit 1)
