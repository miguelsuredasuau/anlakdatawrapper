export DW_CONFIG_PATH ?= tests/dist/config.docker.js

m ?= *

docker_compose := docker-compose -f docker-compose-test.yml

.PHONY: test
test: | test-setup  ## Run unit tests
	$(MAKE) test-run cmd="sh -c 'npm test -- -m \"$(m)\"'"

test-watch: | test-setup  ## Run unit tests in watch mode
	$(MAKE) test-run cmd="sh -c 'npm test -- -w -m \"$(m)\"'"

.PHONY: test-coverage
test-coverage: | test-setup  ## Run unit tests with coverage report
	$(MAKE) test-run cmd="sh -c 'npm run test:coverage -- -m \"$(m)\"'"

.PHONY: test-setup
test-setup:  ## Build TS, create tables and run migrations in the testing database
	npm run build
	$(MAKE) test-run cmd="sh -c 'node /app/scripts/db-initialized.js || node /app/libs/orm/script/sync-db.js'"

.PHONY: test-teardown
test-teardown:  ## Stop and remove the testing database
	$(docker_compose) down

.PHONY: test-run
test-run:  ## Run command specified by the variable 'cmd' in the testing node container
	$(docker_compose) run --rm \
		-w /app/libs/orm \
		-e "DW_CONFIG_PATH=$(DW_CONFIG_PATH)" \
		-e "NODE_ENV=test" \
		node $(cmd)

.PHONY: test-shell
test-shell:  ## Run shell in the testing node container
	$(MAKE) test-run cmd='bash'

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-16s\033[0m %s\n", $$1, $$2}'
