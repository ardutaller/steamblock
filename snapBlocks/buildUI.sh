#!/bin/bash
# Creates a folder named 'ui' can copies the Javascript/Electron UI components
# into it minus the Emscripten/GP components and adds uiTest.html.
# Test in browser by running a local webserver in the 'ui' folder.

rm -rf ui
rm -rf translations
rm -rf img

cp -r ../chromeApp/webapp ui
rm ui/gp_wasm.data
rm ui/gp_wasm.js
rm ui/gp_wasm.wasm
rm ui/emModule.js
rm ui/emscripten.css

mv ui/img .
mv ui/translations .
