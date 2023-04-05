## Dev environment

DataReporter

Requirements:
* DataReporter builds correctly with Node 12

Consider using `nodenv`, see for more info:
https://joshmorel.ca/post/node-virtual-environments-with-nodenv/

Requirements:
* Data reported builds correctly with Node 12
* Install node 12.22.12 with nodenv and ensure shims are added to PATH
see for more info: https://github.com/nodenv/nodenv#how-it-works

```
nodenv install 12.22.12
nodenv local 12.22.12
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
    * `docker-compose run --rm server create_db`  Will start server and run. exec /app/manage.py database create_tables.
      This step is required **only once**.


* Not needed anymore, might be useful for local development: start UI proxy
    * Enter project root directory
    * `cd client`
    * `npm run start`  Starts babel and webpack dev server which  will proxy  redash and plywood backend

* `open http://localhost:5000`

## Local Development

Consider using (https://github.com/pyenv/pyenv#installation)[pyenv] for installing local Python pyenv app. Datareporter container images are shipped with Python 3.8.7

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

Follow the tutorial: https://redash.io/help/open-source/dev-guide/debugging

And run the debugging session:
```
pip install ptvsd
# and start debugging session
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

### Components

#### Datareporter server
* **directory**: `redash`
* **debug**: Please follow the instruction from (https://redash.io/help/open-source/dev-guide/debugging)[redash]
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
This is depricated but still available for backward compatibility.
First make sure to authenticate with `npm login` then build and publish the package:

```
cd plywood/client
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


### Docker installation issues

if you are having issue building docker images, try to remove ~/.docker/config.json file
```bash
rm  ~/.docker/config.json
```