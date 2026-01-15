FROM node:23
WORKDIR /var/opt/tanks
COPY . .
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
RUN useradd -m tanks && chown -R tanks /var/opt/tanks
USER tanks
RUN npm install
RUN cp patches/b2_broad_phase.js node_modules/@box2d/core/dist/collision
# Patch the @box2d/core to include https://github.com/Lusito/box2d.ts/pull/53
RUN npm run build
EXPOSE 3000
USER root
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node dist -s autorun"]