#!/bin/bash
rm -rf compiled
coffee -c -o compiled coffee/*.litcoffee
cat compiled/* > jelli.js
rm -rf compiled
