export DW_CONFIG_PATH ?= /app/services/pixeltracker/test/config.docker.js

test_dir ?= 'services/pixeltracker'

docker_compose := docker-compose -f docker-compose-test.yml

.PHONY: test
test: | test-setup  ## Run unit tests
	$(MAKE) test-run cmd="sh -c 'cd \"/app/$(test_dir)\" && npm test'"

.PHONY: test-performance
test-performance: | test-setup  ## Run performance tests
	$(MAKE) test-run cmd="sh -c 'cd \"/app/$(test_dir)\" && npm run test:performance'"

.PHONY: test-setup
test-setup:  ## Create the testing database if it isn't running
	[[ -n $$($(docker_compose) ps --services --filter status=running mysql) ]] || \
		$(MAKE) test-run cmd="sh -c '/app/scripts/wait-for-db.sh && /app/scripts/sync-db.js'"

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
