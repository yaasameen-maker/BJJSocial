# Dockerfile for BJJSocial backend (FastAPI)
# Build a small image that runs the FastAPI app with Uvicorn.

FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Add the app directory to the PYTHONPATH
ENV PYTHONPATH "${PYTHONPATH}:/app"

# Avoid Python writing pyc files and buffer stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy only packaging file first for better caching
COPY BJJSocial/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code into the container
COPY ./BJJSocial .

# Default DB: use a local SQLite file inside the container unless overridden
ENV DATABASE_URL="sqlite:///./bjj.db"

# Expose the port the app will listen on. Cloud Run will inject this.
EXPOSE 8080

# Run the application. Cloud Run injects the PORT environment variable.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT"]
