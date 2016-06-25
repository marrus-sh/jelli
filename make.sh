#!/bin/bash
rm -rf compiled
coffee -c -o compiled coffee
echo "/*

#  Jelli Game Engine  #

Compiled from CoffeeScript.
In several parts ;)

*/" > jelli.js
echo "
//  Screen:
" >> jelli.js
cat compiled/screen.js >> jelli.js
echo "
//  Control:
" >> jelli.js
cat compiled/control.js >> jelli.js
echo "
//  Sheet:
" >> jelli.js
cat compiled/sheet.js >> jelli.js
rm -rf compiled
