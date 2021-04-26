## Dev environment

Run `git submodule init` && `git submodule update` after checking out the repository
It will pull turnilo dependency to the `turnilo` folder.
(SSH github credentials required to perform this action
https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh)

redash

* `npm install` Installs all node dependencides to for redash 
* `make up`  Does  docker-compose up -d --build  
* `docker-compose run --rm server create_db`  Will start server and run. exec /app/manage.py database create_tables
* `npm run build` Builds front end to  the folder .../client/dist/
* `npm run start` Starts babel and webpack dev server which  will proxy  redash and turnillo backend  
* `open http://localhost:5000` 

turnilo

* `cd turnilo`
* `npm install`  Installs all node dependencides to  turnilo (If you see errors related to node-sass  downgrade Node.js 13.3.0 )
* `npm run build:dev` Builds code  to dist folder 
* `npm run start:dev:examples` Creates an example database  from wikipedia
* `open http://localhost:9090`
