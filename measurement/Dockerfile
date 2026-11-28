FROM ghcr.io/gitleaks/gitleaks:v8.30.1@sha256:c00b6bd0aeb3071cbcb79009cb16a60dd9e0a7c60e2be9ab65d25e6bc8abbb7f AS gitleaks
FROM mcr.microsoft.com/playwright:v1.65.0-noble@sha256:9beb546099e11f52d62e505537914870e01a67e0e6b00ae41da4775324e73dbe

USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 git \
    && rm -rf /var/lib/apt/lists/*
COPY --from=gitleaks /usr/bin/gitleaks /usr/local/bin/gitleaks

WORKDIR /opt/quality-measurement
COPY measurement/ /opt/quality-measurement/measurement/
RUN npm ci --prefix /opt/quality-measurement/measurement --no-audit --no-fund

ENTRYPOINT ["python3", "-m", "measurement"]
