#!/bin/sh

# Check if nginx is running and serving the maintenance page
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health)

if [ "$response" = "200" ]; then
    echo "Maintenance page is healthy"
    exit 0
else
    echo "Maintenance page is not responding properly"
    exit 1
fi
