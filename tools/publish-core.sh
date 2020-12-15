#!/usr/bin/env sh

BASEDIR=$(dirname "$0")
cd "$BASEDIR";
cd "..";
nx build core --prod
cd dist/nwplay-core
npm publish
