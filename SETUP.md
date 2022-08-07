## Dev environment

Run `git submodule init` && `git submodule update` after checking out the repository
It will pull turnilo dependency to the `turnilo` folder.
(SSH github credentials required to perform this action
https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh)

datareporter

Consider using `nodenv`, see for more info:
https://joshmorel.ca/post/node-virtual-environments-with-nodenv/

Requirements:
* Data reported builds correctly with Node 12

* Build UI - Required to build ui for
    * Enter project root directory
    * `cd client`
    * `npm install` Installs all node dependencies to for redash
    * `npm run build` Builds front end to  the folder `client/dist/`

* Build Plywood
    * Enter project root directory
    * `cd plywood`
    * `npm install` Installs all node dependencies to for plywood
    * `npm run build` Builds plywood server end to  the folder `plywood/dist/`

* Setup docker compose
    * `make up` or `docker-compose up -d --build`  to start required services like postgres app server
    * `docker-compose run --rm server create_db`  Will start server and run. exec /app/manage.py database create_tables.
      This step is required **only once**.


* Start UI proxy
    * Enter project root directory
    * `cd client`
    * `npm run start`  Starts babel and webpack dev server which  will proxy  redash and turnillo backend

* `open http://localhost:5000`



turnilo

* `cd turnilo`
* `npm install`  Installs all node dependencides to  turnilo (If you see errors related to node-sass  downgrade Node.js 13.3.0 )
* `npm run build:dev` Builds code  to dist folder
* `npm run start:dev:examples` Creates an example database  from wikipedia
* `open http://localhost:9090`
