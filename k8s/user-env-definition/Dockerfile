# Use the official Python image as the base image
FROM python:3.9.18-alpine3.18

# Create a non-root user and group with no home directory and restricted shell access
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup -h /app -s /sbin/nologin

# Set the working directory to /app
WORKDIR /app

# Copy your application files
COPY log_event.py .
COPY /lesson_resources /lesson_resources

# Install required packages (SQLAlchemy, SQLite, Pandas)
RUN apk add --no-cache py3-pip sqlite \
    && pip install SQLAlchemy pandas beautifulsoup4 numpy \
    # Remove pip and its dependencies after installation
    && apk del py3-pip

# Create the data.db file with write permissions for appuser
RUN touch data.db && chown appuser:appgroup data.db && chmod 774 data.db

# Switch to the non-root user
USER appuser
