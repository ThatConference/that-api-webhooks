# that-api-webhooks

[![Actions Status](https://github.com/ThatConference/that-api-webhooks/workflows/Push%20Master%20CI/badge.svg)](https://github.com/ThatConference/that-api-webhooks/workflows/actions)

middleware webhooks

## Authentication

Uses basic authentication. Preferred method is via header, though the **less secure** query string will also be accepted. This is unfortunately required as some services can't set an authorization header for their webhooks.

Authorization header always takes precidence.

For basic authentication the username and password is base64 encoded. For example:

`$ base64 username:password`

Post example with header

```bash
$ curl -d "<data to post>" \
- H "Content-Type: application/xml" \
- H "Authorization: Basic <Encoded username:password>"
- X POST https://that.tech/endpoint
```

Post example with query string

```bash
$ curl -d "<data to post>" \
-H "Content-Type: application/xml" \
-X POST https://that.tech/endpoint?Basic=<Encoded username:password>
```
