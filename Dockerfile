# ==========================================
# Multi-Stage Production Dockerfile for Render
# Packages React 18 Frontend & Spring Boot 3 Backend
# ==========================================

# Stage 1: Build React 18 Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Spring Boot 3 Backend with Embedded Frontend Assets
FROM maven:3.9.9-eclipse-temurin-17-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B
COPY backend/src ./src
# Copy compiled frontend SPA bundle into Spring Boot's static resources folder
COPY --from=frontend-builder /app/frontend/dist ./src/main/resources/static/
RUN mvn clean package -DskipTests

# Stage 3: Lightweight Production JRE Runner
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-builder /app/backend/target/*.jar app.jar

# Render supplies $PORT environment variable dynamically (defaults to 8080)
ENV PORT=8080
EXPOSE ${PORT}

ENTRYPOINT ["sh", "-c", "java -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT} -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
