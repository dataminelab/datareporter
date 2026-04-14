.PHONY: compose_build up test_db create_database clean down tests lint fmt backend-unit-tests frontend-unit-tests test build watch start redis-cli bash

compose_build:
	docker compose build

up:
	docker compose up -d --build

test_db:
	@for i in `seq 1 5`; do \
		if (docker compose exec postgres sh -c 'psql -U postgres -c "select 1;"' 2>&1 > /dev/null) then break; \
		else echo "postgres initializing..."; sleep 5; fi \
	done
	docker compose exec postgres sh -c 'psql -U postgres -c "drop database if exists tests;" && psql -U postgres -c "create database tests;"'

pull-deepseek-r1:
	docker compose exec ollama ollama pull deepseek-r1:7b

create_database:
	docker compose run server create_db

clean:
	docker compose down && docker compose rm

down:
	docker compose down

tests:
	docker compose run server tests

fmt:
	@echo "Formatting changed files..."
	@CHANGED=$$(git diff --cached --name-only --diff-filter=ACM; git diff --name-only --diff-filter=ACM); \
	CHANGED=$$(echo "$$CHANGED" | sort -u); \
	JS_FILES=$$(echo "$$CHANGED" | grep -E '\.(js|jsx|ts|tsx|json|css|scss|less|md)$$'); \
	PY_FILES=$$(echo "$$CHANGED" | grep -E '\.py$$'); \
	if [ -z "$$CHANGED" ]; then echo "No changed files to format."; exit 0; fi; \
	if [ -n "$$JS_FILES" ]; then echo "$$JS_FILES" | xargs npx prettier --config .prettierrc.json --write; fi; \
	if [ -n "$$PY_FILES" ]; then echo "$$PY_FILES" | xargs black; echo "$$PY_FILES" | xargs ruff check --fix 2>/dev/null; fi; \
	STAGED=$$(git diff --cached --name-only --diff-filter=ACM); \
	if [ -n "$$STAGED" ]; then echo "$$STAGED" | xargs git add; fi
	@echo "Done. Changed files formatted."

lint:
	flake8 --config=.flake8 .

backend-unit-tests: up test_db
	docker compose run --rm --name tests server tests

frontend-unit-tests:
	npm ci
	npm test

test: lint backend-unit-tests frontend-unit-tests

build:
	npm run build

watch:
	npm run watch

start:
	npm run start

redis-cli:
	docker compose run --rm redis redis-cli -h redis

bash:
	docker compose run --rm server bash
