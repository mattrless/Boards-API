FROM node:24-bookworm-slim

RUN apt-get update && apt-get install -y \
    git \
    curl \
    openssl \
    && rm -rf /var/lib/apt/lists/*

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

RUN npm install -g @nestjs/cli

WORKDIR /workspace
