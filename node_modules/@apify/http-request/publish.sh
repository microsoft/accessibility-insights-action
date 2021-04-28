#!/bin/bash

set -e

# Notes:
# - Use only "master" branch
# - New release gets always published as LATEST

RED='\033[0;31m'
NC='\033[0m' # No Color

PACKAGE_VERSION=`node -pe "require('./package.json').version"`
BRANCH=`git status | grep 'On branch' | cut -d ' ' -f 3`
BRANCH_UP_TO_DATE=`git status | grep 'nothing to commit' | tr -s \n ' '`;
GIT_TAG="v${PACKAGE_VERSION}"

if [ -z "${BRANCH_UP_TO_DATE}" ]; then
    printf "${RED}You have uncommitted changes!${NC}\n"
    exit 1
fi

echo "Pushing to git ..."
git push

# Master gets published as LATEST if that version doesn't exists yet and retagged as LATEST otherwise.
if [ "${BRANCH}" = "master" ]; then
    echo "Publishing version ${PACKAGE_VERSION} with tag \"latest\" ..."
    RUNNING_FROM_SCRIPT=1 npm publish --tag latest --access public

    echo "Tagging git commit with ${GIT_TAG} ..."
    git tag ${GIT_TAG}
    git push origin ${GIT_TAG}
    echo "Git tag: ${GIT_TAG} created."
else
    printf "${RED}apify-shared package uses only a master branch which gets published with a latest NPM tag!${NC}\n"
    exit 1
fi

echo "Done."
