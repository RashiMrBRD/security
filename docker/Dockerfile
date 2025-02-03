FROM httpd:2.4-alpine

# Install required packages
RUN apk add --no-cache curl

# Enable required Apache modules
RUN sed -i \
    -e 's/^#\(LoadModule deflate_module.*\)/\1/' \
    -e 's/^#\(LoadModule expires_module.*\)/\1/' \
    -e 's/^#\(LoadModule headers_module.*\)/\1/' \
    -e 's/^#\(LoadModule rewrite_module.*\)/\1/' \
    /usr/local/apache2/conf/httpd.conf

# Create directory structure
RUN mkdir -p /usr/local/apache2/htdocs/src/scripts \
    && mkdir -p /usr/local/apache2/htdocs/src/styles \
    && mkdir -p /usr/local/apache2/htdocs/assets

# Copy our maintenance page files
COPY index.html /usr/local/apache2/htdocs/
COPY src/scripts/*.js /usr/local/apache2/htdocs/src/scripts/
COPY src/styles/*.css /usr/local/apache2/htdocs/src/styles/
COPY assets/* /usr/local/apache2/htdocs/assets/

# Copy Apache configuration
COPY docker/apache.conf /usr/local/apache2/conf/extra/apache-maintenance.conf

# Include our custom configuration
RUN echo "Include conf/extra/apache-maintenance.conf" \
    >> /usr/local/apache2/conf/httpd.conf

# Add healthcheck script
COPY docker/healthcheck.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/healthcheck.sh

# Set working directory
WORKDIR /usr/local/apache2/htdocs

# Add cache busting environment variable
ARG BUILD_DATE=20241226
ENV BUILD_DATE=$BUILD_DATE

# Expose port 80
EXPOSE 80

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Start Apache
CMD ["httpd-foreground"]
