# Dockerfile for BJJSocial backend (FastAPI)

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Avoid Python writing pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy requirements first for better caching
COPY BJJSocial/requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the entire application package
COPY ./BJJSocial /app/BJJSocial

# Expose the port the app will listen on.
EXPOSE 8080

# DEBUGGING STEP 1: List files to verify container structure.
# This command will cause deployment to fail, but will show file layout in logs.
CMD ["ls", "-R", "/app"]
