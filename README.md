# TLS Checking Tool

Check the TLS versions and ciphersuites a server supports.

For more, read our accompanying [blog](https://redmaple.tech/blogs/2021/fun-with-tls/).

## Prerequisite

1. Install node
2. `npm install`
3. `build openssl` (The script provided will build for Mac) or place the openssl bin in ./src/openssl

## Run

`make start`

The script will ask for a host and port to test.
