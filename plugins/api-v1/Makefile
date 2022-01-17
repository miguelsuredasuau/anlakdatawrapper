export test_dir := plugins/api-v1
export DW_CONFIG_PATH ?= /app/$(test_dir)/src/tests/config.docker.cjs

%:
	cd ../../services/api && $(MAKE) $@
