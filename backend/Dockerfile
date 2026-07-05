FROM python:3.13-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy dependency files
COPY pyproject.toml .
COPY uv.lock* .

# Install dependencies
RUN uv sync --frozen --no-dev

# Copy application code
COPY . .

# Run migrations then start server
CMD ["sh", "-c", "uv run uvicorn main:app --host 0.0.0.0 --port 8000"]