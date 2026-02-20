import pytest
from plywood.dialect import PostgresDialect, MySQLDialect, BigQueryDialect, AthenaDialect, DruidDialect

@pytest.fixture
def pg_dialect():
    return PostgresDialect()

@pytest.fixture
def mysql_dialect():
    return MySQLDialect()

@pytest.fixture
def bq_dialect():
    return BigQueryDialect()

@pytest.fixture
def athena_dialect():
    return AthenaDialect()

@pytest.fixture
def druid_dialect():
    return DruidDialect()
