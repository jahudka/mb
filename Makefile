.PHONY: default
default: build

.PHONY: clean
clean:
	rm -rf public/*

.PHONY: build
build: clean
	node_modules/.bin/parcel build --cache-dir var/cache/parcel --dist-dir public --public-url /mb src/*.html src/**/*.html

.PHONY: run
run:
	node_modules/.bin/parcel serve --cache-dir var/cache/parcel --dist-dir public src/*.html src/**/*.html
