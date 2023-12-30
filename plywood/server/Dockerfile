FROM node:12.18.3-alpine as frontend-builder
ARG version
RUN apk update
RUN apk add git
RUN apk add bash
WORKDIR /app
RUN echo "this folder is empty right now"
COPY package*.json /app/
COPY . /app/
COPY client /app/client
WORKDIR /app/client
RUN echo "Building client before building and starting server"
RUN npm install
RUN npm run build
WORKDIR /app
RUN echo "Now build server"
RUN npm install
RUN npm run build

FROM node:12.18.3-alpine
RUN addgroup -S plywood && adduser -S plywood
COPY --from=frontend-builder --chown=plywood /app/dist/ /app/dist/
COPY --from=frontend-builder  --chown=plywood /app/node_modules/ /app/node_modules/
COPY --from=frontend-builder --chown=plywood /app/package.json /app/package.json
COPY --from=frontend-builder --chown=plywood   /app/client/build /app/client/build
COPY --from=frontend-builder --chown=plywood   /app/client/package.json /app/client/package.json
ENV DATAREPORTER_VERSION=${version}
EXPOSE 3000
WORKDIR /app
USER plywood
CMD node dist/server.js
