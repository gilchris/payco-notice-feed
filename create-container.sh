#!/bin/bash

NAME=payco-developer-notice-feed
WORKING_PATH=/home/ubuntu/data
GIT_PATH=/data/gilchris.github.io

sudo docker container create \
    -e GIT_PATH=$GIT_PATH \
    -v $WORKING_PATH:$GIT_PATH \
    --name $NAME  \
    $NAME:latest