export DW_CONFIG_PATH ?= /app/services/api/test/config.docker.js
m ?= '!PHP*'

docker_compose := docker-compose -f docker-compose-test.yml

.PHONY: test
test: | test-setup  ## Run unit tests
	$(MAKE) test-run cmd="sh -c 'cd /app/services/api && npm test -- -m \"$(m)\"'"

.PHONY: test-coverage
test-coverage: | test-setup  ## Run unit tests with coverage report
	$(MAKE) test-run cmd="sh -c 'cd /app/services/api && npm run test:coverage -- -m \"$(m)\"'"

.PHONY: test-setup
test-setup:  ## Create the testing database if it isn't running
	[[ -n $$($(docker_compose) ps --services --filter status=running mysql) ]] || \
		$(MAKE) test-run cmd="sh -c '/app/services/api/scripts/wait-for-db.sh && /app/scripts/sync-db.js'"

.PHONY: test-teardown
test-teardown:  ## Stop and remove the testing database
	$(docker_compose) down

.PHONY: test-run
test-run:  ## Run command specified by the variable 'cmd' in the testing node container
	$(docker_compose) run --rm \
		-e "DW_CONFIG_PATH=$(DW_CONFIG_PATH)" \
		-e "NODE_ENV=test" \
		node $(cmd)

.PHONY: test-shell
test-shell:  ## Run shell in the testing node container
	$(MAKE) test-run cmd='bash'

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-16s\033[0m %s\n", $$1, $$2}'
