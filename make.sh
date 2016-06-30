#!/bin/bash
rm -rf source/compiled source/modules/compiled source/engine/compiled
coffee -c -o source/compiled source/*.litcoffee
coffee -c -o source/modules/compiled source/modules/*.litcoffee
coffee -c -o source/engine/compiled source/engine/*litcoffee
cat source/compiled/* source/modules/compiled/* source/engine/compiled/* > jelli.js
rm -rf source/compiled source/modules/compiled source/engine/compiled
