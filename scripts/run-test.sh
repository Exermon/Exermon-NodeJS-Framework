#!/bin/sh
set -e

name=$(head -n 1 app-name.txt)
SERVER_NAME="$name-test"

version=$(head -n 1 "$SERVER_NAME.version")

i_name="$SERVER_NAME:$version"
c_name="$SERVER_NAME$version"

echo "=======================================> 当前版本号为: $version, 现在正在启动"

docker run -p 3071:3070 --restart=always -d --name "$c_name" "$i_name"
echo "=======================================> 新版本容器启动成功"
