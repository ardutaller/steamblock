#!/bin/bash

# Pass the directory where the IDE files are as a parameter
idesource=$1
if [ -z "$idesource" ]; then
	echo "Please provide a path to the IDE folder"
	echo "Example:"
	echo
	echo "./build-deb.sh ../microblocks-linux [destination] [version-number] [arch]"
	exit 1
fi;

destdir=$2
if [ -z "$destdir" ]; then destdir=".."; fi

version=$3
if [ -z "$version" ]; then version="0-unknown"; fi

arch=$4
if [ -z "$arch" ]; then arch="all"; fi

mkdir -p deb/microblocks/usr/local/bin
mkdir -p deb/microblocks/usr/share/icons
mkdir -p deb/microblocks/usr/share/applications
mkdir -p deb/microblocks/usr/share/menu
mkdir -p deb/microblocks/DEBIAN
mkdir -p deb/microblocks/usr/share/doc/microblocks
chmod 0755 deb/microblocks/usr -R

cp -r $idesource deb/microblocks/usr/share/microblocks
cp microblocks deb/microblocks/usr/local/bin
cp MicroBlocks.png deb/microblocks/usr/share/icons
cp MicroBlocks.desktop deb/microblocks/usr/share/applications
cp copyright deb/microblocks/usr/share/doc/microblocks
cp microBlocks.menu deb/microblocks/usr/share/menu

size=`du deb/microblocks | tail -n1 | cut -f1`
cat control | sed -E "s/@AppVersion/$version/" | sed -E "s/@Arch/$arch/" | sed -E "s/@InstalledSize/$size/"> deb/microblocks/DEBIAN/control
cp prerm postinst copyright deb/microblocks/DEBIAN/

cd deb
fakeroot dpkg-deb --build microblocks
cd ..
mv deb/microblocks.deb $destdir/microblocks-$arch.deb

rm -rf deb
