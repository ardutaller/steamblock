#!/bin/bash
# Build a MacOS icns file
# Start with a 1024x1024 png file named MicroBlocks_1024.png

mkdir MicroBlocks.iconset

# Standard Resolutions
sips -z 16 16     MicroBlocks_1024.png --out MicroBlocks.iconset/icon_16x16.png
sips -z 32 32     MicroBlocks_1024.png --out MicroBlocks.iconset/icon_32x32.png
sips -z 128 128   MicroBlocks_1024.png --out MicroBlocks.iconset/icon_128x128.png
sips -z 256 256   MicroBlocks_1024.png --out MicroBlocks.iconset/icon_256x256.png
sips -z 512 512   MicroBlocks_1024.png --out MicroBlocks.iconset/icon_512x512.png

# High-DPI / Retina Resolutions (@2x)
sips -z 32 32     MicroBlocks_1024.png --out MicroBlocks.iconset/icon_16x16@2x.png
sips -z 64 64     MicroBlocks_1024.png --out MicroBlocks.iconset/icon_32x32@2x.png
sips -z 256 256   MicroBlocks_1024.png --out MicroBlocks.iconset/icon_128x128@2x.png
sips -z 512 512   MicroBlocks_1024.png --out MicroBlocks.iconset/icon_256x256@2x.png
sips -z 1024 1024 MicroBlocks_1024.png --out MicroBlocks.iconset/icon_512x512@2x.png

# Build icns file and copy to parent directory
iconutil -c icns MicroBlocks.iconset
mv MicroBlocks.icns ..

# Cleanup
rm -R MicroBlocks.iconset
