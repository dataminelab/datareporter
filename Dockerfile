FROM node:14.17 AS frontend-builder

# Controls whether to build the frontend assets
ARG skip_frontend_build

WORKDIR /frontend
COPY bin/build_frontend.sh .
COPY client/ /frontend/client
COPY viz-lib/ /frontend/viz-lib
COPY plywood/server/ /frontend/plywood/server/
RUN if [ "x$skip_frontend_build" = "x" ] ; then \
    echo "Building frontend";\
    ./build_frontend.sh;\
  else \
    echo "Skipping frontend build" &&\
    mkdir -p /frontend/client/dist &&\
    touch /frontend/client/dist/multi_org.html &&\
    touch /frontend/client/dist/index.html;\
  fi

FROM python:3.8-slim-buster

EXPOSE 5000

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
    iputils-ping \
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

ENV POETRY_VERSION=1.6.1
ENV POETRY_HOME=/etc/poetry
ENV POETRY_VIRTUALENVS_CREATE=false
RUN curl -sSL https://install.python-poetry.org | python3 -

COPY pyproject.toml poetry.lock ./

ARG POETRY_OPTIONS="--no-root --no-interaction --no-ansi"
# for LDAP authentication, install with `ldap3` group
# disabled by default due to GPL license conflict
ARG install_groups="main,all_ds,dev"
RUN /etc/poetry/bin/poetry install --only $install_groups $POETRY_OPTIONS

COPY --chown=redash . /app
COPY --chown=redash --from=frontend-builder /frontend/client/dist /app/client/dist
RUN chown redash:redash -R /app
RUN find /app
USER redash
ENV PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python
# The version is being set arbitrarily by the builder
ARG version
ENV DATAREPORTER_VERSION=$version
ENTRYPOINT ["/app/bin/docker-entrypoint"]
CMD ["server"]