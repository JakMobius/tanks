FROM node:23 AS builder
WORKDIR /var/opt/tanks
# Install native deps for canvas
RUN apt-get update && apt-get install -y \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install
COPY . .
# Patch the @box2d/core to include https://github.com/Lusito/box2d.ts/pull/53
RUN cp patches/b2_broad_phase.js node_modules/@box2d/core/dist/collision
RUN npm run build
RUN useradd -m tanks && chown -R tanks /var/opt/tanks
USER tanks
EXPOSE 3000
CMD ["node", "dist", "-s", "autorun"]
