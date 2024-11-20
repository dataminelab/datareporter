#!/bin/bash
set -e

GIT_COMMIT=$(git rev-parse --short=8 HEAD)

if [[ "${GITHUB_REF_TYPE-""}" == "tag" ]]; then
  PREFIX="stable"
elif [[ "${BRANCH-""}" == "master" ]]; then
  PREFIX="stable"
else
  PREFIX="develop"
fi

latest=$(git describe --tags --abbrev=0 || echo "0.0.0")
VERSION="${latest#$PREFIX-}"
VERSION_MAJOR="${VERSION%%.*}"
VERSION_MINOR_PATCH="${VERSION#*.}"
VERSION_MINOR="${VERSION_MINOR_PATCH%%.*}"
VERSION_PATCH_PRE_RELEASE="${VERSION_MINOR_PATCH#*.}"
VERSION_PATCH="${VERSION_PATCH_PRE_RELEASE%%[-+]*}"
VERSION_PRE_RELEASE=""
case "$VERSION" in
  *-*)
    VERSION_PRE_RELEASE="${VERSION#*-}"
    VERSION_PRE_RELEASE="${VERSION_PRE_RELEASE%%+*}"
    ;;
esac
if [[ "${VERSION_MAJOR}" != "$(date '+%Y')" ]]; then
  VERSION_MAJOR="$(date '+%Y')"
  VERSION_MINOR="$(date '+%-m')"
  VERSION_PATCH="0"
elif [[ "${VERSION_MINOR}" != "$(date '+%-m')" ]]; then
  VERSION_MINOR="$(date '+%-m')"
  VERSION_PATCH="0"
fi
if [[ "${VERSION_PRE_RELEASE}" != "${GIT_COMMIT}" ]];then
  VERSION_PATCH=$((VERSION_PATCH+1))
fi

case "$PREFIX" in
 "stable" )
   NEW_TAG="$PREFIX-${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}"
   ;;
 "develop" )
   NEW_TAG="$PREFIX-${VERSION_MAJOR}.${VERSION_MINOR}.${VERSION_PATCH}-$GIT_COMMIT"
   ;;
esac
#create version
echo $NEW_TAG
