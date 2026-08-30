#!/bin/bash
set -euo pipefail

WEBROOT=/www/wwwroot/supabase.guelichweb.store
ENV_FILE=/www/docker/supabase/.env

USER=$(grep '^DASHBOARD_USERNAME=' "$ENV_FILE" | cut -d= -f2-)
PASS=$(grep '^DASHBOARD_PASSWORD=' "$ENV_FILE" | cut -d= -f2-)
SECRET=$(openssl rand -hex 32)

mkdir -p "$WEBROOT/login" "$WEBROOT/auth"
mkdir -p /www/server/panel/vhost/nginx/extension/supabase.guelichweb.store

cp -r /tmp/sb-login/login/* "$WEBROOT/login/"
cp -r /tmp/sb-login/auth/* "$WEBROOT/auth/"
cp /tmp/sb-login/nginx-proxy.conf /www/server/panel/vhost/nginx/proxy/supabase.guelichweb.store/proxy.conf
cp /tmp/sb-login/supabase.guelichweb.store.conf /www/server/panel/vhost/nginx/supabase.guelichweb.store.conf

cat > /www/docker/supabase/gate-config.php <<EOF
<?php
return [
    'username' => '${USER}',
    'password' => '${PASS}',
    'secret' => '${SECRET}',
];
EOF

B64=$(echo -n "${USER}:${PASS}" | base64 -w0)
echo "set \$supabase_kong_auth \"Basic ${B64}\";" > /www/server/panel/vhost/nginx/extension/supabase.guelichweb.store/auth-header.conf

chown -R www:www "$WEBROOT/login" "$WEBROOT/auth"
chown root:www /www/docker/supabase/gate-config.php
chmod 640 /www/docker/supabase/gate-config.php

nginx -t
/etc/init.d/nginx reload

echo "OK: Supabase login page deployed"
