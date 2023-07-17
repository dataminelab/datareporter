#!/usr/bin/env bash
echo "This will retry connections until PostgreSQL/Redis is up, then perform database installation/migrations as needed."

# Status command timeout
STATUS_TIMEOUT=45
# Create tables command timeout
CREATE_TIMEOUT=60
# Upgrade command timeout
UPGRADE_TIMEOUT=600
# Time to wait between attempts
RETRY_WAIT=10
# Max number of attempts
MAX_ATTEMPTS=5

# Check Settings (for debug)
# /app/manage.py check_settings

# Initialize attempt counter
ATTEMPTS=0
while ((ATTEMPTS < MAX_ATTEMPTS)); do
  echo "Starting attempt ${ATTEMPTS} of ${MAX_ATTEMPTS}"
  ATTEMPTS=$((ATTEMPTS + 1))
  echo "Installing Redash:"
  timeout $CREATE_TIMEOUT /app/manage.py database create_tables
  echo "Tables created"
  echo "Running Redash database migrations after install"
  timeout $UPGRADE_TIMEOUT /app/manage.py db upgrade
  echo "Upgrade complete"

  echo "Running Redash database migrations:"
  timeout $UPGRADE_TIMEOUT /app/manage.py db upgrade
  echo "Upgrade complete"

  STATUS=$(timeout $STATUS_TIMEOUT /app/manage.py status 2>&1)
  RETCODE=$?
  echo "Return code: ${RETCODE}"
  echo "Status: ${STATUS}"
  case "$RETCODE" in
  0)
    exit 0
    ;;
  124)
    echo "Status command timed out after ${STATUS_TIMEOUT} seconds."
    ;;
  esac
  case "$STATUS" in
  *sqlalchemy.exc.OperationalError*)
    echo "Database not yet functional, waiting."
    ;;
  *sqlalchemy.exc.ProgrammingError*)
    echo "Database does not appear to be installed."
    ;;
  esac
  echo "Waiting ${RETRY_WAIT} seconds before retrying."
  sleep 10
done
echo "Reached ${MAX_ATTEMPTS} attempts, giving up."
exit 1
