#!/bin/bash

BUILD_PATH="$(dirname -- "${BASH_SOURCE[0]}")"

docker build  $BUILD_PATH/stack/base  -t dataminelab/datareporter-base --build-arg stack_id=com.dataminelab.datareporter
docker build  $BUILD_PATH/stack/build  -t dataminelab/datareporter-build\
                    --build-arg stack_id=com.dataminelab.datareporter\
                    --build-arg base_image=dataminelab/datareporter-base
docker build  $BUILD_PATH/stack/run  -t dataminelab/datareporter-run\
                    --build-arg stack_id=com.dataminelab.datareporter\
                    --build-arg base_image=dataminelab/datareporter-base
