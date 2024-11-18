#!/bin/bash

#GIT_PATH=/usr/gilchris.github.io
GIT_PATH=~/tmp
if [ -d "$GIT_PATH" ]; then
    cd $GIT_PATH
    git pull
else
    git clone https://github.com/gilchris/gilchris.github.io.git
fi

OLD_FILE=$GIT_PATH/feeds/payco_developer_notice.xml
NEW_FILE=$GIT_PATH/feeds/_payco_developer_notice.xml

cd /usr/src/app
node app.js > $NEW_FILE

if diff "$OLD_FILE" "$NEW_FILE" >/dev/null; then
    rm -f $NEW_FILE
    exit 0
fi

rm -f $OLD_FILE
mv $NEW_FILE $OLD_FILE

cd $GIT_PATH
git add feeds/payco_developer_notice.xml
git commit -m "Update feeds/payco_developer_notice.xml"
git push