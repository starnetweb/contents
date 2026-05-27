FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create data directory for SQLite persistence
RUN mkdir -p /app/data

# Expose port
EXPOSE 4001

# Run uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "4001"]
