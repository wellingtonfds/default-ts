#!/bin/bash -x

isFunction() { [[ "$(declare -Ff "$1")" ]]; }


TOOLS="docker-compose run --rm tools"

# Start this script from the docker/ folder

set -e


before_build() {
    echo before build
}

after_build() {
   $path  bash -c "pwd" 
   bash -c "cd dist && mkdir -p storage/uploads && mkdir -p storage/temp"

   cp src/storage/files.json dist/storage/
}

init_dev() {
    if [ ! -f "src/storage/files.json" ]
    then
        cp src/storage/files.json.example src/storage/files.json
    fi

    if [ ! -f "./.env" ]
    then
        cp ./.env.example ./.env 
    fi

    bash -c "if [ ! -d node_modules ]; then npm install; fi"
}
case "$1" in
    before_build|after_build|init_dev)
        eval "$1"
        ;;
    *)
        echo "Valid commands are before_build|after_build|init_dev"
esac
