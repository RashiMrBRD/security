#!/bin/sh

# Check if Argo Tunnel is running (replace with your actual Argo Tunnel endpoint)
ARGO_ENDPOINT="http://your-argo-tunnel-endpoint"

# Try to connect to Argo Tunnel
if curl -s -f -m 3 "$ARGO_ENDPOINT/health" > /dev/null; then
    echo "Argo Tunnel is up"
    exit 1  # Exit with error so Docker shows maintenance page
else
    echo "Argo Tunnel is down"
    exit 0  # Exit successfully to serve maintenance page
fi
