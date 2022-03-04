FROM node:12.18.3-alpine
RUN apk update
RUN apk add git
WORKDIR /usr/src/app
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD npm start