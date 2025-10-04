# Dockerfile for BJJSocial backend (FastAPI)
# Build a small image that runs the FastAPI app with Uvicorn.

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Avoid Python writing pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies needed for some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy only packaging files first for better caching
COPY BJJSocial/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code into the container's working directory
COPY ./BJJSocial .

# Default DB: use a local SQLite file inside the container unless overridden
ENV DATABASE_URL="sqlite:///./bjj.db"

# Expose port
EXPOSE 8000

# Run Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
