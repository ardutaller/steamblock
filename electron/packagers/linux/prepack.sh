#!/bin/sh
tag=$1

if [ ! -f electron-$tag-linux-x64.zip ]; then
	echo "Fetching Electron $tag for Linux..."
	wget https://github.com/electron/electron/releases/download/$tag/electron-$tag-linux-x64.zip
fi
echo "Building Electron file tree for Linux..."
rm -Rf prepack/linux
mkdir -p prepack/linux/
cd prepack/linux/
unzip -q ../../electron-$tag-linux-x64.zip
mv electron microblocks
cp -rL ../../../chromeApp/webapp resources
cd locales
mv en-US.pak ..
rm -f *
mv ../en-US.pak .
cd ..
cd resources
npx asar extract default_app.asar default_app
cp ../../../index.js default_app
cp ../../../preload.js default_app
cp ../../../package.json default_app

rm default_app/index.html
rm default_app/main.js
rm default_app/default_app.js
rm default_app/styles.css
rm default_app/icon.png
rm -r default_app/octicon

npx asar pack default_app default_app.asar
rm -r default_app
cd ../../..
