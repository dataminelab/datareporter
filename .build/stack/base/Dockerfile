FROM python:3.7-slim-buster
# Set required CNB information
ARG stack_id
LABEL io.buildpacks.stack.id="${stack_id}"
EXPOSE 5000
ARG NODE_VERSION=12.22.12 #requires to be repeated as it needs to be avilable as env variable
RUN useradd --create-home datareporter

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
ENV PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python
# Set user and group (as declared in base image)
USER ${CNB_USER_ID}:${CNB_GROUP_ID}
