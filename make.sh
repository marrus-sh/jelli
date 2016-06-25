#!/bin/bash
rm -rf compiled
coffee -c -o compiled coffee
echo "/*

#  Jelli Game Engine  #

Compiled from CoffeeScript.
In several parts ;)

*/
" > jelli.js
cat compiled/* >> jelli.js
rm -rf compiled
