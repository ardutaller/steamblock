#!/bin/sh
tag=$1

if [ ! -f electron-$tag-darwin-arm64.zip ]; then
	echo "Fetching Electron $tag for MacOS..."
	wget https://github.com/electron/electron/releases/download/$tag/electron-$tag-darwin-arm64.zip
fi
echo "Building Electron file tree for MacOS..."
rm -Rf prepack/macos
mkdir -p prepack/macos/
cd prepack/macos/
unzip -q ../../electron-$tag-darwin-arm64.zip
cp ../../packagers/macos/Info.plist Electron.app/Contents
mv Electron.app/Contents/MacOS/Electron Electron.app/Contents/MacOS/MicroBlocks
cp -rL ../../../chromeApp/webapp Electron.app/Contents/Resources
cd Electron.app/Contents/Resources
npx asar extract default_app.asar default_app
cp ../../../../../index.js default_app
cp ../../../../../preload.js default_app
cp ../../../../../package.json default_app
npx asar pack default_app default_app.asar
rm -r default_app
cd ../Frameworks/Electron\ Framework.framework/Resources/
mv en.lproj ..
rm -R *.lproj
mv ../en.lproj .
cd ../../../../..
mv Electron.app MicroBlocks.app

