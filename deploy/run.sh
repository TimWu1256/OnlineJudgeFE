#!/bin/sh

base=/OJ_FE

build_vendor_dll()
{
  if [ ! -e "${base}/build/vendor-manifest.json" ]
  then
      npm run build:dll
  fi
}
cd $base
npm install v8.12.0 && \
nvm use 8.12.0 && \
build_vendor_dll && \
npm run build

if [ $? -ne 0 ]; then
    echo "Build error, please check node version and package.json"
    exit 1
fi

exec nginx -c /OJ_FE/deploy/nginx.conf
