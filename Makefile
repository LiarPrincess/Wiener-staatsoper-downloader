.PHONY: build watch run

build:
	./node_modules/.bin/tsc

watch:
	./node_modules/.bin/tsc -w

run: build
	node ./dist/app.js
