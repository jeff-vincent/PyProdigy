# Use the official Python image as the base image
FROM python:3.9.18-alpine3.18

# Create a non-root user and group with no home directory and restricted shell access
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup -D -s /sbin/nologin

# Set the working directory to /app
WORKDIR /app

# Copy your application files
COPY log_event.py .
COPY /lesson_resources /app/lesson_resources

# Install required packages (SQLAlchemy, SQLite, Pandas)
# RUN apk add --no-cache py3-pip sqlite \
#     && pip install SQLAlchemy pandas beautifulsoup4 numpy \
#     # Remove pip and its dependencies after installation
#     && apk del py3-pip

# Create the data.db file with write permissions for appuser
RUN touch data.db && chown appuser:appgroup data.db && chmod 644 data.db

# Lock down the filesystem - remove access to system directories
RUN chmod 700 /root \
    && chmod 755 /usr /bin /sbin /lib /etc \
    && rm -rf /tmp/* /var/tmp/* \
    && mkdir -p /tmp && chmod 1777 /tmp

# Set strict permissions on /app directory
RUN chown -R appuser:appgroup /app \
    && chmod -R 755 /app \
    && chmod 644 /app/log_event.py \
    && chmod -R 644 /app/lesson_resources

# Remove potentially dangerous binaries and create restricted environment
RUN rm -f /bin/su /usr/bin/sudo /sbin/mount /sbin/umount /bin/chmod /bin/chown 2>/dev/null || true

# Switch to the non-root user and lock to /app directory
USER appuser

# Set environment to restrict path and prevent directory traversal
ENV HOME=/app \
    PATH=/usr/local/bin:/usr/bin:/bin \
    PYTHONPATH=/app
