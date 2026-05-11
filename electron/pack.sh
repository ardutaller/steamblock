#!/bin/sh
echo "Querying latest electron version..."
tag=`curl --silent -m 10 --connect-timeout 5 "https://api.github.com/repos/electron/electron/releases/latest" | grep tag_name | sed -E 's/.*"([^"]+)".*/\1/'` 

./linux-prepack.sh $tag
echo "Linux file tree built"

./macos-prepack.sh $tag
echo "MacOS file tree built"
