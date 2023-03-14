Guardian Football Assets
========================

The source of all football assets used on The Guardian and scripts to easily compress and upload them to s3.

## Install

Make sure you have `frontend` Janus credentials.

You will also need [Node.js](https://nodejs.org).

Get dependencies by running `npm install`. 

## Preview

```bash
$ npm run prepare
```

Resized images can be found in `build/`

## Deploy

Compress images and deploy to s3:

```bash
$ npm run deploy
```

This can take a minute or two. Results won't be seen immediately due to caching.
