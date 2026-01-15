#!/bin/sh

mkdir -p /var/opt/tanks/dist/data/tanks
chown -R tanks:tanks /var/opt/tanks/dist/data/tanks 2>/dev/null || true
chmod -R 755 /var/opt/tanks/dist/data/tanks 2>/dev/null || true

exec su tanks -c "$@"