#!/bin/bash

PR_NUMBER=$(expr "$CIRCLE_PULL_REQUEST" : ".*pull/\(.*\)")
PR_PATH=$(expr "$CIRCLE_PULL_REQUEST" : ".*\(pull.*\)")

RES=$(curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/datawrapper/controls/issues/$PR_NUMBER/comments)

echo $RES | grep -q "Storybook deployed"

MATCH=$?

if [ $MATCH -eq 0 ]
then
  echo "Comment already posted for $PR_PATH"
  exit 0
fi

curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{ \"body\": \"### Storybook deployed to:\n> https://$S3_PATH/$CIRCLE_PROJECT_REPONAME/$PR_PATH/v2/\n> https://$S3_PATH/$CIRCLE_PROJECT_REPONAME/$PR_PATH/v3/\" }" \
  -X POST https://api.github.com/repos/datawrapper/controls/issues/$PR_NUMBER/comments

echo "Comment posted!"
exit 0
