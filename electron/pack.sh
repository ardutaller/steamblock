#!/bin/bash
echo "Querying latest electron version..."
tag=`curl --silent -m 10 --connect-timeout 5 "https://api.github.com/repos/electron/electron/releases/latest" | grep tag_name | sed -E 's/.*"([^"]+)".*/\1/'` 

system=$1

if [[ -z "$system" || "$system" == 'linux' ]]; then
./packagers/linux/prepack.sh $tag
echo "Linux file tree built"
fi

if [[ -z "$system" || "$system" == 'macos' ]]; then
./packagers/macos/prepack.sh $tag
echo "MacOS file tree built"
fi

if [[ -z "$system" || "$system" == 'windows' ]]; then
./packagers/windows/prepack.sh $tag
echo "Windows file tree built"
fi

echo "Cleaning up previous builds..."
rm -rf out/*
cd out

echo "Creating standalone zip releases..."

if [[ -z "$system" || "$system" == 'linux' ]]; then
echo "Zipping Linux release..."
mv ../prepack/linux microblocks-linux
zip -rq microblocks-linux.zip microblocks-linux
rm -rf microblocks-linux
fi

if [[ -z "$system" || "$system" == 'macos' ]]; then
echo "Zipping MacOS release..."
mv ../prepack/macos/MicroBlocks.app .
zip -rq microblocks-macos.zip MicroBlocks.app
rm -rf MicroBlocks.app
fi

if [[ -z "$system" || "$system" == 'windows' ]]; then
echo "Zipping Windows release..."
mv ../prepack/windows microblocks-windows
zip -rq microblocks-windows.zip microblocks-windows
rm -rf microblocks-windows
fi

exit 0
echo "Cleaning up..."
cd ..
rm -rf prepack
