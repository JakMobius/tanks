FROM node:23 AS builder
WORKDIR /var/opt/tanks
COPY . .
RUN useradd -m tanks && chown -R tanks /var/opt/tanks
RUN npm install
RUN cp patches/b2_broad_phase.js node_modules/@box2d/core/dist/collision
# Patch the @box2d/core to include https://github.com/Lusito/box2d.ts/pull/53
RUN npm run build
USER tanks
EXPOSE 3000
CMD ["node", "dist", "-s", "autorun"]