# Use the official Python image as the base image
FROM python:3.9.18-alpine3.18

# Create a non-root user and group with no home directory and restricted shell access
RUN addgroup -g 1000 -S appgroup && \
    adduser -u 1000 -S appuser -G appgroup -h /app -s /sbin/nologin

# Set the working directory to /app
WORKDIR /app
COPY log_event.py .

# Install pip and specific Python packages (example: Flask)
RUN apk add --no-cache py3-pip \
    && pip install Flask \
    # Remove pip and its dependencies after installation
    && apk del py3-pip

# Switch to the non-root user
USER appuser
