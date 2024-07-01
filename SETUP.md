## Dev environment

DataReporter

Requirements:
* DataReporter builds correctly with Node 14
Consider using [nodenv](https://joshmorel.ca/post/node-virtual-environments-with-nodenv/)
* Install node v14 with nodenv and ensure shims are added to PATH
see for more info: https://github.com/nodenv/nodenv#how-it-works
see https://learn.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-wsl for windows-wsl2-nvm

```
nodenv install 14
nodenv local 14
```

Alternatively you can use nvm
```
sudo apt update
sudo apt install curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
```
set nvm version
```
nvm install v14
nvm alias default v14
```
You should enhance your local files in order to use v14 so type `nano ~/.bashrc` then enhance file according to below
```
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm use v14 > /dev/null
```

* Build UI - Required to build ui for
    * Enter project root directory
    * `cd client`
    * `npm install` Installs all node dependencies to for redash
    * `npm run build` Builds front end to the folder `client/dist/`

* Build Plywood
    * Enter project root directory
    * `cd plywood/server`
    * `npm install` Installs all node dependencies to for plywood
    * `npm run build` Builds plywood server end to the folder `plywood/server/dist/`

* Setup docker compose
    * `make up` or `docker-compose up --build`  to start required services like postgres app server
    * `docker-compose run --rm server create_db` Will start server and run. exec /app/manage.py database create_tables.
      This step is required **only once**.
    * Any change to SQL data made on python side requires to create a migration file for upgrading the required database columns: `docker-compose run server manage db migrate`
    * Later on and only if necessary, in order to upgrade local database run: `docker-compose run --rm server manage db upgrade`


* Not needed anymore, might be useful for local development: start UI proxy
    * Enter project root directory
    * `cd client`
    * `npm run start` Starts babel and webpack dev server which will proxy redash and plywood backend.

* `open http://localhost:5000`

## Local Development

Consider using [pyenv](https://github.com/pyenv/pyenv#installation) for installing local Python pyenv app. Datareporter container images are shipped with Python 3.8.7, [ubuntu guide](https://www.dedicatedcore.com/blog/install-pyenv-ubuntu/)
```
# install necessary python version
pyenv install 3.8.7 
# make sure you run below command in the datareported folder
# automatically select whenever you are in the current directory (or its subdirectories)
pyenv local 3.8.7
# note that on certani linux distros you might need to also run below command
# $ git clone https://github.com/yyuu/pyenv-virtualenv.git ~/.pyenv/plugins/pyenv-virtualenv
# create virtualenv
pyenv virtualenv 3.8.7 .venv
source ./.venv/bin/activate
# note that in some system .venv might be created in your home folder: /.pyenv/versions/.venv
# $ source ~/.pyenv/versions/.venv/bin/activate
```

Installation in Linux using virtualenvwrapper:
```
sudo pacman -S yay 
yay -S python38
mkvirtualenv -p /usr/bin/python3.8 python38
```

If working with Visual Studio Code

Follow the [tutorial](https://redash.io/help/open-source/dev-guide/debugging)

And run the debugging session:
```
# install below library
pip install ptvsd

# start debugging session using below line
docker-compose stop server && docker-compose run --rm --service-ports server debug && docker-compose start server
```

### Running tests locally

First ensure that the "tests" database is created:
```
docker-compose run --rm postgres psql -h postgres -U postgres -c "create database tests"
```

Then run the tests:
```
docker-compose run --rm server tests
```

In order to test viz-lib folder you need to install dependencies and run tests because you cant have 2 react versions in the same project. To do that run below commands in the viz-lib folder:
```
npm install antd@^3 react@^16.8 react-dom@^16.8 && npm run test
```

### Components
#### Datareporter server
* **directory**: `redash`
* **debug**: Please follow the instruction from [redash](https://redash.io/help/open-source/dev-guide/debugging)
* **changes:**
  * All changes are immediately visible as the python application is interpreted and it's running directly from source code.
#### Datareporter frontend
  * **submodules** - for debug and changes they follow root fronted app:
    * Lib viz
      * **directory:** `viz-lib`
    * Plywood client
      * **directory:** `plywood/client`
  * **directory:** `client`
  * **debug:** Can be debugged from browser open application at `http://localhost:8080` || `5000` and use browser debugger.
  * **changes:**
    * By default, changes are not reflected. You need go into `client` directory and start `npm run watch`.
    That will start watched for source code changes for Datareporter frontend and all submodules.
    * At liniux system you may face problem of too many file system watchers. That will result in error message
    ```Error: ENOSPC: System limit for number of file watchers reached, watch ```
    To solve it you need to increase the number of available watches by :
    ```sudo sysctl -w fs.inotify.max_user_watches=512000```

#### Plywood server
* **directory:** `plywood/server`
* **debug:** connect nodejs debugger to `localhost:9231`
* **changes:**
  * All changes should be reflected automatically. The server is running in watch mode with incremental build support
    and should rebuild at any source code change.
  * To see details/logs of build go into repo root dir and run `docker-compose logs plywood`

### Publishing NPM reporter-plywood package
First make sure to authenticate with `npm login` then build and publish the package:

```
cd plywood/server/client
npm install
npm run compile
npm publish
```
### Debugging notes

cd client
npm start

visit http://localhost:8080/ instead of using port 5050

To run Python debugger:
docker-compose stop server && docker-compose run --rm --service-ports server debug && docker-compose start server

To log messages to/from Plywood add to the Plywood env (in docker-compose) following variable: `LOG_MODE=request_and_response` or `LOG_MODE=response_only`

### Docker installation issues

if you are having issue building docker images, try to remove ~/.docker/config.json file
```bash
rm  ~/.docker/config.json
```

## Docker connectivity issues for testing connection between containers
```bash
>> docker network connect datareporter_default router
>> docker inspect -f '{{range $key, $value := .NetworkSettings.Networks}}{{$key}} {{end}}' router
docker_default, datareporter_default
>> docker inspect -f '{{range $key, $value := .NetworkSettings.Networks}}{{$key}} {{end}}' datareporter-server-1
datareporter_default 
>> docker exec datareporter-server-1 ping router -c2
PING router (172.19.0.9) 56(84) bytes of data.
64 bytes from router.datareporter_default (172.19.0.9): icmp_seq=1 ttl=64 time=1.51 ms
64 bytes from router.datareporter_default (172.19.0.9): icmp_seq=2 ttl=64 time=0.057 ms

--- router ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 3ms
rtt min/avg/max/mdev = 0.057/0.781/1.506/0.725 ms
```

### How to handle package controll on Python side
```
# Install Poetry locally, [see-settings](https://github.com/getredash/redash/blob/c97afeb327d8d54e7219ac439cc93d0f234763e5)
pip3 install poetry==1.6.1 # it has to be 1.6.1 or upper because of group usages

# Uninstall Poetry locally
curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/901bdf0491005f1b3db41947d0d938da6838ecb9/get-poetry.py | python3 - --uninstall

# Install additional packages into repository for Python side
poetry add <package-name>

# Uninstall a package
poetry remote <package-name>
```