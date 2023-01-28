#!/bin/sh
set -e

cd client
echo "Clean install viz-lib & redash-client "
npm ci --unsafe-perm || cat /root/.npm/_logs/*
echo "Build viz-lib & redash-client "
npm run build || cat /root/.npm/_logs/*
