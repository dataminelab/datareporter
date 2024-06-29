#!/bin/bash
set -e

GIT_COMMIT=`git rev-parse --short=8 HEAD`

if [[ "${GITHUB_REF_TYPE-""}" == "tag" ]]; then
  PREFIX="stable"
elif [[ "${BRANCH-""}" == "master" ]]; then
  PREFIX="stable"
else
  PREFIX="develop"
fi

#create version
NEW_TAG="$PREFIX-$(date '+%Y.%-m.%-d-%H%M')-$GIT_COMMIT"
echo $NEW_TAG
