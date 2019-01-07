# Youtube title analysis

## requirement

- Node > 8

## how to

Enable [YouTube Data API v3](https://developers.google.com/youtube/v3/getting-started?hl=ja) and get API KEY.

```shell
$ cp .envrc.sample .envrc
$ vim .envrc
$ direnv allow
$ node request.js # get all videos from specified channel
$ # see output_requested.json
$ node parse.js
$ # see output_parsed.json
```
