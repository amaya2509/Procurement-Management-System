# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy all POMs to satisfy Maven reactor module definitions
COPY pom.xml ./pom.xml
COPY eureka-server/pom.xml ./eureka-server/pom.xml
COPY api-gateway/pom.xml ./api-gateway/pom.xml
COPY user-service/pom.xml ./user-service/pom.xml
COPY supplier-service/pom.xml ./supplier-service/pom.xml
COPY pr-service/pom.xml ./pr-service/pom.xml
COPY po-service/pom.xml ./po-service/pom.xml
COPY approval-service/pom.xml ./approval-service/pom.xml
COPY common-library/pom.xml ./common-library/pom.xml
COPY common-library/src ./common-library/src
COPY po-service/src ./po-service/src
RUN mvn -pl po-service -am package -DskipTests --no-transfer-progress

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app
COPY --from=builder /app/po-service/target/*.jar app.jar

EXPOSE 8084

ENTRYPOINT ["java", "-jar", "app.jar"]
