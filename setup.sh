#!/bin/bash

# Install npm packages
npm install

# Build react components
npm run build

# cd into widget folder
cd mimicri

pip install -e .

jupyter labextension develop mimicri --overwrite

# Exit to main folder
cd ..