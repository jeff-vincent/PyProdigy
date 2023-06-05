FROM python:3.11-alpine
COPY requirements.txt .
RUN pip install -r requirements.txt
WORKDIR /app/src
COPY ./app .
WORKDIR /app/
CMD uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload