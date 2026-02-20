# Dev environment

This is a setup guide for datareporter's devolopment environment
DataReporter builds correctly with Node version 18.20, consider using [nodenv](https://joshmorel.ca/post/node-virtual-environments-with-nodenv/)

* [ensure shims are added to PATH](https://github.com/nodenv/nodenv#how-it-works)
* [for windows-wsl2-nvm](https://learn.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-wsl)

Feel free to use nvm

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
# Set nvm version
nvm install v18.20
nvm alias default v18.20
```

Now you can enhance `.bashrc` or `.bash_profile` in order to use v18.20 automatically or you might need to run `nvm use v18.20` every time you open a new terminal in case above technique didnt work

```sh
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use v18.20 > /dev/null
```

## Install python3 and it's dependencies on your local environment

```sh
sudo apt install -y python3.10 python3.10-venv python3.10-dev
sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.10 1
python3.10 --version
curl -sSL https://install.python-poetry.org | POETRY_VERSION=2.1.1 python3 -
poetry --version
POETRY_OPTIONS="--no-root --no-interaction --no-ansi"
install_groups="main,all_ds,dev"
poetry install --only $install_groups $POETRY_OPTIONS
```

## Build UI - Required to build ui for

```sh
  cd client # Enter front-end directory
  npm install # Install dependencies
  npm run build # Build for `client/dist/`
  # this also buils for wiz-lib, plywood client and plywood server
```

## Setup docker compose

```sh
# This step is required on first build
docker compose up --build # or make up to start required services like postgres app server
docker compose run --rm server create_db # start server and run. exec /app/manage.py database create_tables. 
# Database Update process
docker compose run server manage db stamp head # If you get an error saying "target database is not up to date" you can run this command
docker compose run server manage db migrate # Any change to back-end models requires to create a migration
docker compose run --rm server manage db upgrade # Upgrade database with recent migration
```

## Installation for Linux using virtualenvwrapper

```sh
sudo pacman -S yay
yay -S python38
mkvirtualenv -p /usr/bin/python3.8 python38
```

### Testing

#### Backend

```sh
# First ensure that the "tests" database is created
docker compose run --rm postgres psql -h postgres -U postgres -c "create database tests"
# Run the tests
docker compose run --rm server tests
# Run tests for a specific module
docker-compose run --rm server pytest -v tests/plywood/test_json.py
```

#### viz-lib

```sh
cd viz-lib
npm run test
```

#### e2e

use below to seed client

```sh
cd client && npm run cypress db-seed # Seed the database with initial data for cypress tests
```

```sh
cd client
npm run cypress run # Run cypress tests in headless mode
```

### Components

#### Redash server and client

* **directory**: `redash`
  * **debug**: Please follow the instruction from [redash](https://redash.io/help/open-source/dev-guide/debugging)
  * **changes:**
    * All changes are immediately visible as the python application is interpreted and it's running directly from source code.

#### Data Reporter client

* **directory:** `viz-lib`
* **directory:** `plywood/client`
* **directory:** `client`
  * **debug:** Can be debugged from browser open application at `http://localhost:8080` || `5000` and use browser debugger.
  * **changes:**
    * By default, changes are not reflected. You need go into `client` directory and start `npm run watch`.
    That will start watched for source code changes for Data Reporter frontend and all submodules.
    * At liniux system you may face problem of too many file system watchers. That will result in error message
    `Error: ENOSPC: System limit for number of file watchers reached, watch`
    To solve it you need to increase the number of available watches by :
    `sudo sysctl -w fs.inotify.max_user_watches=512000`

#### Plywood server

* **directory:** `plywood`
* **debug:** connect nodejs debugger to `localhost:9231`
* **changes:**
  * All changes should be reflected automatically. The server is running in watch mode with incremental build support
    and should rebuild at any source code change.
  * To see details/logs of build go into repo root dir and run `docker compose logs plywood`

## Local Development

Consider using [pyenv](https://github.com/pyenv/pyenv#installation) for installing local Python pyenv app. Data Reporter container images are shipped with Python 3.8.7, [ubuntu guide](https://www.dedicatedcore.com/blog/install-pyenv-ubuntu/)

```sh
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

### Settting up environment

You have to set up environment variables in the `.env` file in the root directory of the project. This file is used to configure various settings for the application, such as database connections, API keys, and other configurations.
For reference, see the `.env.example` file in the project root. It contains sample environment variables and their expected formats. Copy this file to `.env` and adjust the values as needed for your local setup.

```sh
cp .env.example .env
# Edit .env to set your configuration
```

if you setup the deepseek wth ollama server on local you need to download the model first

```sh
docker compose exec ollama ollama pull deepseek-r1:7b # Pull deepseek-r1:7b model from ollama
```

### Debugging notes

If you are working on Visual Studio Code follow this [tutorial](https://redash.io/help/open-source/dev-guide/debugging) then you can run the debugging session following below:

```sh
pip install ptvsd # install below library
docker compose stop server && docker compose run --rm --service-ports server debug && docker compose start server # start debugging session
```

To log messages from Plywood (in docker compose): `LOG_MODE=request_and_response` or `LOG_MODE=response_only`

if you are having issue building docker images, try to remove `config.json` file from docker folder

```bash
rm  ~/.docker/config.json
```

below is for how to start the development environment using docker compose
this will rewrite environment variables from `.env` and the compose file

```sh
docker-compose -f compose.dev.yml up -d
```

* Supported Report Engines
  * postgres
  * mysql  
  * bigquery
  * athena
  * druid
  * pg
  * json

### Docker connectivity issues for testing connection between containers

This is useful when testing fresh datasources so cross server connections are needed. For example, if you want to connect to a router container from the datareporter-server container.

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

### Python package handling

We are using poetry for package control on backend [see this redash commit tree for more info](https://github.com/getredash/redash/blob/c97afeb327d8d54e7219ac439cc93d0f234763e5), and npm for client and viz-lib

```sh
# Install poetry using pip
pip3 install poetry==1.8.3

# Uninstall Poetry locally
curl -sSL https://raw.githubusercontent.com/python-poetry/poetry/901bdf0491005f1b3db41947d0d938da6838ecb9/get-poetry.py | python3 - --uninstall

# Install a new package
poetry add <package-name>

# Uninstall an old package
poetry remove <package-name>
```
