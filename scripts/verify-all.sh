#!/usr/bin/env bash

cat package.json | \
    grep 'verify:' | grep -v ':all"' | \
    grep -oE '"([^"]+)":' | cut -d\" -f2 | \
    awk '{ print "npm run "$0; }' | \
    bash -c 'while read -r line; do echo "$line"; $line || true; done'
