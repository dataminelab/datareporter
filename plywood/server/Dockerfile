FROM node:12.18.3-alpine as frontend-builder
RUN apk update
RUN apk add git
WORKDIR /app
RUN echo "this folder is empty right now"
COPY package*.json /app/
COPY . /app/
COPY client /app/client
WORKDIR /app/client
RUN ls
RUN npm install
# I can see the file with cat on below line
RUN cat ./compile
# but this or the below line is needed to build the client
# RUN /usr/bin/bash /app/client/compile
RUN ./compile
# above is not working as well
RUN npm run build
RUN echo "Building client before building and starting server"
WORKDIR /app
RUN ls client
RUN echo "Now build server"
RUN npm install
RUN npm run build
FROM node:12.18.3-alpine
RUN addgroup -S plywood && adduser -S plywood
COPY --from=frontend-builder --chown=plywood /app/dist/ /app/dist/
COPY --from=frontend-builder  --chown=plywood /app/node_modules/ /app/node_modules/
EXPOSE 3000
WORKDIR /app
USER plywood
CMD node dist/server.js
