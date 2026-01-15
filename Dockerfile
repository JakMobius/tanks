FROM node:23
WORKDIR /var/opt/tanks

RUN apt-get update && apt-get install -y gosu && rm -rf /var/lib/apt/lists/*

COPY --chown=1000:1000 . .

RUN groupadd -g 1000 tanks && \
    useradd -u 1000 -g tanks -m tanks

USER tanks
RUN npm install
RUN cp patches/b2_broad_phase.js node_modules/@box2d/core/dist/collision
RUN npm run build

EXPOSE 3000

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist", "-s", "autorun"]