#!/bin/sh

# Replace ${PORT} in the nginx config with the actual PORT environment variable
envsubst '$PORT' < /etc/nginx/sites-enabled/nginx_default > /etc/nginx/sites-enabled/nginx_default

# Start nginx
nginx -g 'daemon off;'
