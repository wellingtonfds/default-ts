#!/bin/bash -x

isFunction() { [[ "$(declare -Ff "$1")" ]]; }


TOOLS="docker-compose run --rm tools"

# Start this script from the docker/ folder

set -e

touch environment

before_build() {
    echo before build
}

after_build() {
   $path  bash -c "pwd" 
   bash -c "cd dist && mkdir -p storage/uploads"
}

case "$1" in
    before_build|after_build)
        eval "$1"
        ;;
    *)
        echo "Valid commands are before_build|after_build"
esac
