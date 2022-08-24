ARG NODE_VERSION=14.17.3
FROM node:${NODE_VERSION} as frontend-builder


WORKDIR /frontend
COPY bin/build_frontend.sh .
COPY client/ /frontend/client
COPY viz-lib/ /frontend/viz-lib
RUN echo "Building frontend";\
    ./build_frontend.sh;

FROM node:${NODE_VERSION} as plywood-builder
RUN apk update
RUN apk add git
WORKDIR /plywood
COPY package*.json /plywood
RUN npm install
COPY plywood /plywood
RUN npm run build

FROM python:3.7-slim-buster

EXPOSE 5000

# Controls whether to install extra dependencies needed for all data sources.
ARG skip_ds_deps

ARG S6_OVERLAY_VERSION=3.1.0.1
ARG NODE_VERSION=14.17.3
ENV PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python
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
    sudo \
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

# We first copy only the requirements file, to avoid rebuilding on every file
# change.
COPY requirements.txt requirements_bundles.txt requirements_dev.txt requirements_all_ds.txt ./
RUN  pip install -r requirements.txt;
RUN if [ "x$skip_ds_deps" = "x" ] ; then pip install -r requirements_all_ds.txt ; else echo "Skipping pip install -r requirements_all_ds.txt" ; fi

COPY --chown=redash .  /app
COPY --from=frontend-builder --chown=redash /frontend/client/dist /app/client/dist
COPY --from=plywood-builder --chown=redash /plowood/dist /app/plywood/dist
COPY --from=plywood-builder --chown=redash   /plowood/node_modules/ /app/plywood/node_modules/
RUN find /app
USER redash
ENTRYPOINT ["/app/bin/docker-entrypoint"]
CMD ["server"]
