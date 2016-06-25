#!/bin/bash
rm -rf compiled
coffee -c -o compiled source/*.litcoffee
cat compiled/* > jelli.js
rm -rf compiled
