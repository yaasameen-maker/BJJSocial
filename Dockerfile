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
# This preserves the directory structure needed for package imports
COPY ./BJJSocial /app/BJJSocial

# Expose the port the app will listen on.
EXPOSE 8080

# Run the application as a module to fix relative import errors
CMD ["python", "-m", "uvicorn", "BJJSocial.main:app", "--host", "0.0.0.0", "--port", "8080"]
