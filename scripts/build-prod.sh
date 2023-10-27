#!/bin/sh

name=$(head -n 1 app-name.txt)
SERVER_NAME="$name-test"

version=$(head -n 1 "$SERVER_NAME.version")
new_version=$((version + 1))

echo "=======================================> 当前版本号为: $version, 现在进行部署版本: $new_version"

new_i_name="$SERVER_NAME:$new_version"
old_c_name="$SERVER_NAME$version"

echo "=======================================> 开始构建镜像: $new_i_name"
docker build -f ./Prod.Dockerfile -t "$new_i_name" .

# 检查是否存在旧容器
if docker ps -a | grep -q "$old_c_name"; then
  CID=$(docker ps -a | grep "$old_c_name" | awk '{print $1}')
  echo "=======================================> 存在容器 $old_c_name, CID-$CID"
  docker stop "$old_c_name"
  docker rm "$old_c_name"
  echo "=======================================> 删除容器成功"
fi

# 将新版本号写回
echo "$new_version" > "$SERVER_NAME.version"
echo "=======================================> 版本更新成功"
