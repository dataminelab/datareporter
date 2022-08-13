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
    * `npm run build` Builds front end to  the folder `client/dist/`

* Build Plywood
    * Enter project root directory
    * `cd plywood`
    * `npm install` Installs all node dependencies to for plywood
    * `npm run build` Builds plywood server end to the folder `plywood/dist/`

* Setup docker compose
    * `make up` or `docker-compose up -d --build`  to start required services like postgres app server
    * `docker-compose run --rm server create_db`  Will start server and run. exec /app/manage.py database create_tables.
      This step is required **only once**.


* Start UI proxy
    * Enter project root directory
    * `cd client`
    * `npm run start`  Starts babel and webpack dev server which  will proxy  redash and turnillo backend

* `open http://localhost:5000`
