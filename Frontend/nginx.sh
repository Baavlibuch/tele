#!/bin/sh

# Replace ${PORT} in the nginx config with the actual PORT environment variable
envsubst '$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
nginx -g 'daemon off;'
