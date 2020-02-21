#!/bin/sh
 
THIS_DIR=`dirname $0`
pushd $THIS_DIR > /dev/null 2>&1
 
CSSCRIPT_DIR=/usr/local/CS-Script
/usr/local/bin/mono $CSSCRIPT_DIR/cscs.exe -nl Tiled2UnityLite.cs -s=0.01 $* &> tiled2unitylite.log
 
popd > /dev/null 2<&1
