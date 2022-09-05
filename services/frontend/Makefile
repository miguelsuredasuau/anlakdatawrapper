export DW_CONFIG_PATH ?= /app/services/frontend/tests/config.docker.js

docker_compose := docker-compose -f docker-compose-test.yml

.PHONY: test
test: | test-setup  ## Run unit tests for both client-side and server-side code
	$(MAKE) test-run cmd="sh -c 'node ../api/src/index.js & (npm run test:client -- -f \"$(f)\" && npm run test:server -- -f \"$(f)\")'"

.PHONY: test-client
test-client: | test-setup  ## Run unit tests for client-side code only
	$(MAKE) test-run cmd="sh -c 'npm run test:client -- -f \"$(f)\"'"

.PHONY: test-server
test-server: | test-setup  ## Run unit tests for server-side code only
	$(MAKE) test-run cmd="sh -c 'node ../api/src/index.js & npm run test:server -- -f \"$(f)\"'"

.PHONY: test-setup
test-setup:  ## Create tables and run migrations in the testing database
	$(MAKE) test-run cmd="sh -c 'node /app/scripts/db-initialized.js || node /app/scripts/sync-db.js'"

.PHONY: test-teardown
test-teardown:  ## Stop and remove the testing database
	$(docker_compose) down

.PHONY: test-run
test-run:  ## Run command specified by the variable 'cmd' in the testing node container
	$(docker_compose) run --rm \
		-w /app/services/frontend \
		-e "DW_CONFIG_PATH=$(DW_CONFIG_PATH)" \
		node $(cmd)

.PHONY: test-shell
test-shell:  ## Run shell in the testing node container
	$(MAKE) test-run cmd='bash'

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-16s\033[0m %s\n", $$1, $$2}'
