#!/bin/bash

if [ -z "$GIT_PATH" ]; then
    GIT_PATH=/data/gilchris.github.io
fi

if [ -d "$GIT_PATH" ]; then
    cd $GIT_PATH
    git pull
else
    git clone https://github.com/gilchris/gilchris.github.io.git
fi

JSON_FILE=feeds/payco_notices.json
FEED_FILE=feeds/payco_notice_feed.xml

cd /usr/src/app
node app.js

cd $GIT_PATH
git add $FEED_FILE
git add $JSON_FILE
git commit -m "Update payco notice feed"
git push