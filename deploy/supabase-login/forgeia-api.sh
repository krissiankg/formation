set -euo pipefail
# Ouvre /rest/v1/ de supabase.guelichweb.store à l'appli FORGE IA hébergée sur AWS,
# uniquement avec l'en-tête secret X-Forgeia-Gate. Le reste du domaine reste derrière la page de login.
TOKEN_FILE=/root/forgeia-gate-token
PROXY_DIR=/www/server/panel/vhost/nginx/proxy/supabase.guelichweb.store
CONF="$PROXY_DIR/forgeia-api.conf"
NGINX=/www/server/nginx/sbin/nginx  # nginx d'aaPanel (pas celui du système)
BACKUP=/root/nginx-backup-supabase-$(date +%Y%m%d%H%M%S).tgz

sudo -n tar czf "$BACKUP" /www/server/panel/vhost/nginx/supabase.guelichweb.store.conf "$PROXY_DIR" 2>/dev/null
echo "backup: $BACKUP"

if ! sudo -n test -s "$TOKEN_FILE"; then
  openssl rand -hex 32 | sudo -n tee "$TOKEN_FILE" >/dev/null
  sudo -n chmod 600 "$TOKEN_FILE"
fi
TOKEN="$(sudo -n cat "$TOKEN_FILE")"

sudo -n tee "$CONF" >/dev/null <<EOF
# FORGE IA (AWS) : accès API PostgREST sans la page de login, si l'en-tête secret est présent.
# Jeton : /root/forgeia-gate-token  |  Secret AWS : forgeia/web/env -> SUPABASE_GATE_TOKEN
location ^~ /rest/v1/ {
    if (\$http_x_forgeia_gate != "$TOKEN") {
        return 302 /login/?next=\$request_uri;
    }
    proxy_pass http://127.0.0.1:8000;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_http_version 1.1;
    proxy_read_timeout 300;
}
EOF
sudo -n chmod 600 "$CONF"

if sudo -n $NGINX -t 2>&1 | tail -2; then
  sudo -n $NGINX -s reload && echo RELOAD_OK
else
  echo "NGINX_TEST_FAILED -> rollback"; sudo -n rm -f "$CONF"; exit 1
fi

sleep 1
echo "sans jeton  : $(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' https://supabase.guelichweb.store/rest/v1/)"
echo "avec jeton  : $(curl -s -o /dev/null -w '%{http_code}' -H "X-Forgeia-Gate: $TOKEN" https://supabase.guelichweb.store/rest/v1/)"
echo "studio /    : $(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' https://supabase.guelichweb.store/)"
unset TOKEN
