NODE ?= node

test:
	@$(NODE) ./node_modules/.bin/mocha \
		--require should \
		--reporter spec \
		--slow 2s \
		--harmony-generators \
		--bail

bench:
	@$(NODE) ./node_modules/.bin/matcha \
	  --harmony-generators \
	  benchmark

.PHONY: test bench
