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
COPY user-service/src ./user-service/src
RUN mvn -pl user-service -am package -DskipTests --no-transfer-progress

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre

WORKDIR /app
COPY --from=builder /app/user-service/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
