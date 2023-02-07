ARG NODE_VERSION=12.18.3

# Datareporter web client
FROM node:${NODE_VERSION} as frontend-builder
WORKDIR /frontend
COPY bin/build_frontend.sh .
COPY client/ /frontend/client
COPY viz-lib/ /frontend/viz-lib
COPY plywood/server/client /frontend/plywood/server/client
RUN ./build_frontend.sh;

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

# Download latest nodejs binary
RUN curl https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz -O

# Extract & install
RUN tar -xf node-v${NODE_VERSION}-linux-x64.tar.xz
RUN ln -s /node-v${NODE_VERSION}-linux-x64/bin/node /usr/local/bin/node
RUN ln -s /node-v${NODE_VERSION}-linux-x64/bin/npm /usr/local/bin/npm
RUN ln -s /node-v${NODE_VERSION}-linux-x64/bin/npx /usr/local/bin/npx
RUN useradd --create-home redash

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
    nginx \
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

#ARG databricks_odbc_driver_url=https://databricks.com/wp-content/uploads/2.6.10.1010-2/SimbaSparkODBC-2.6.10.1010-2-Debian-64bit.zip
#ADD $databricks_odbc_driver_url /tmp/simba_odbc.zip
#RUN unzip /tmp/simba_odbc.zip -d /tmp/ \
#  && dpkg -i /tmp/SimbaSparkODBC-*/*.deb \
#  && echo "[Simba]\nDriver = /opt/simba/spark/lib/64/libsparkodbc_sb64.so" >> /etc/odbcinst.ini \
#  && rm /tmp/simba_odbc.zip \
#  && rm -rf /tmp/SimbaSparkODBC*

WORKDIR /app

# Disalbe PIP Cache and Version Check
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PIP_NO_CACHE_DIR=1

RUN useradd --create-home nginx
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
COPY --chown=redash --from=frontend-builder /frontend/client/dist /app/client/dist
COPY --from=plywood-builder --chown=redash /app/dist /app/plywood/dist
COPY --from=plywood-builder --chown=redash   /app/node_modules/ /app/plywood/node_modules/
COPY --from=plywood-builder --chown=redash   /app/client/build /app/plywood/client/build
COPY --from=plywood-builder --chown=redash   /app/client/package.json /app/plywood/client/package.json
COPY bin/etc /etc
USER root
CMD ["/init"]
