#!/bin/bash

rm -rf Libraries
cp -r ../../../gp/Libraries .
find Libraries -name ".DS_Store" -type f -delete

rm -rf Examples
cp -r ../../../gp/Examples .
find Examples -name ".DS_Store" -type f -delete

rm files.txt
find Libraries -type f >> files.txt
find Examples -type f >> files.txt
