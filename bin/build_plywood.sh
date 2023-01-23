#!/bin/sh
set -e

echo "Build plywood server "
cd plywood/server/client

npm ci  || ( cat /root/.npm/_logs/* && exit 1)
npm run build || ( cat /root/.npm/_logs/* && exit 1)
cd -
