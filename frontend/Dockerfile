# Stage 1 — Build
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --include=dev

COPY . .

# Set API URL for local Docker
ARG VITE_API_URL=http://localhost:5000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build