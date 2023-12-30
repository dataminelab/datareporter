#!/usr/bin/env bash
repo=eu.gcr.io/datareporter
tag=${1-$(date +"%Y%H%M%s")}
echo "building server with $tag"
#docker build plywood/server -t $repo/plywood:$tag && docker push $repo/plywood:$tag &
docker build . -t  $repo/datareporter:$tag
docker push $repo/datareporter:$tag

echo "Tag: $tag"
