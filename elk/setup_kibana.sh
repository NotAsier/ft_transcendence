#!/bin/sh

/usr/local/bin/docker-entrypoint.sh elasticsearch &
ES_PID=$!

until curl -s -u "elastic:${ELASTIC_PASSWORD}" "http://localhost:9200/_cluster/health" >/dev/null 2>&1; do
  sleep 2
done

curl -s -u "elastic:${ELASTIC_PASSWORD}" -X POST \
  "http://localhost:9200/_security/user/kibana_system/_password" \
  -H "Content-Type: application/json" \
  -d "{\"password\": \"${KIBANA_PASSWORD}\"}"

echo "kibana_system password set"

until curl -s -u "elastic:${ELASTIC_PASSWORD}" -X POST "http://kibana:5601/api/saved_objects/_import?overwrite=true" \
  -H "kbn-xsrf: true" \
  --form file=@/tmp/export.ndjson 2>/dev/null | grep -q '"success":true'; do
  sleep 5
done

echo "dashboards imported"

wait $ES_PID
