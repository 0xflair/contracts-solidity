#!/usr/bin/env bash

export LC_ALL=C 

if [[ "$OSTYPE" == "darwin"* ]]; then 
    find ./src/typechain -type f -name '*.d.ts' -exec sed -i '' 's/^interface/export interface/' {} + 
else 
    find ./src/typechain -type f -name '*.d.ts' -exec sed -i 's/^interface/export interface/' {} + 
fi
