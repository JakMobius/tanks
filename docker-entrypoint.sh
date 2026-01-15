#!/bin/sh

if [ -d "/var/opt/tanks/dist/database" ]; then
    chown -R tanks:tanks /var/opt/tanks/dist/database 2>/dev/null || true
    chmod -R 755 /var/opt/tanks/dist/database 2>/dev/null || true
fi

exec "$@"