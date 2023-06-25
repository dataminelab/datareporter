ARG NODE_VERSION=12.18.3



# Datareporter plywood server
FROM node:${NODE_VERSION}-alpine as plywood-builder
ARG NODE_VERSION=12.18.3 #requires to be repeated as it needs to be avilable as env variable
RUN apk update
RUN apk add git
RUN apk add bash
WORKDIR /app
RUN echo "this folder is empty right now"
COPY  plywood/server/ /app/
WORKDIR /app/client
RUN echo "Building client before building and starting server"
RUN npm install
RUN npm run build
WORKDIR /app
RUN echo "Now build server"
RUN npm install
RUN npm run build

# Datareporter app
FROM python:3.7-slim-buster
EXPOSE 5000
ARG NODE_VERSION=12.18.3 #requires to be repeated as it needs to be avilable as env variable
# Controls whether to install extra dependencies needed for all data sources.
ARG skip_ds_deps
ENV PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python

ARG S6_OVERLAY_VERSION=3.1.0.1
RUN apt-get update
RUN apt-get install xz-utils
RUN apt-get -y install curl
ADD https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-noarch.tar.xz /tmp
RUN tar -C / -Jxpf /tmp/s6-overlay-noarch.tar.xz
ADD https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}/s6-overlay-x86_64.tar.xz /tmp
RUN tar -C / -Jxpf /tmp/s6-overlay-x86_64.tar.xz


# Ubuntu packages
RUN apt-get update && \
  apt-get install -y \
    curl \
    gnupg \
    build-essential \
    pwgen \
    libffi-dev \
#    sudo \
    git-core \
    wget \
    # Postgres client
    libpq-dev \
    # ODBC support:
    g++ unixodbc-dev \
    # for SAML
    xmlsec1 \
    # Additional packages required for data sources:
    libssl-dev \
    default-libmysqlclient-dev \
    freetds-dev \
    libsasl2-dev \
    unzip \
    libsasl2-modules-gssapi-mit && \
  # MSSQL ODBC Driver:
#  curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
#  curl https://packages.microsoft.com/config/debian/10/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
  apt-get update && \
#  ACCEPT_EULA=Y apt-get install -y msodbcsql17 && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*



WORKDIR /app

# Disalbe PIP Cache and Version Check
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PIP_NO_CACHE_DIR=1
ENV REDASH_WEB_WORKERS=2

# We first copy only the requirements file, to avoid rebuilding on every file
# change.
COPY requirements.txt requirements_bundles.txt requirements_dev.txt requirements_all_ds.txt ./
RUN  pip install -r requirements.txt;
RUN if [ "x$skip_ds_deps" = "x" ] ; then pip install -r requirements_all_ds.txt ; else echo "Skipping pip install -r requirements_all_ds.txt" ; fi

ENV PLYWOOD_SERVER_URL="http://localhost:3000"
COPY --chown=redash redash  /app/redash
COPY --chown=redash bin  /app/bin
COPY --chown=redash tests  /app/tests
COPY --chown=redash migrations  /app/migrations/
COPY --chown=redash requirements.txt /app
COPY --chown=redash *.cfg py* *py /app
COPY bin/etc/worker /etc
USER root
CMD ["/init"]
