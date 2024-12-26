FROM nginx:alpine

# Copy our maintenance page files
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY themes.css /usr/share/nginx/html/
COPY main.js /usr/share/nginx/html/
COPY favicon.js /usr/share/nginx/html/
COPY theme-detector.js /usr/share/nginx/html/

# Copy our custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add healthcheck script
COPY healthcheck.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/healthcheck.sh

# Install curl for healthcheck
RUN apk add --no-cache curl

# Set working directory
WORKDIR /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
