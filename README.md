Guardian Football Assets
========================

The source of all football assets used on The Guardian and scripts to easily compress and upload them to s3.

## Installation

This requires ImageMagick, if you don't have it install with `brew install imagemagick`

Make sure you have `frontend` Janus credentials.

Get dependencies by running `npm install`. 

## Usage

Use `grunt` to compress and deploy to s3. This can take a minute or two. Results won't be seen immediately due to caching.