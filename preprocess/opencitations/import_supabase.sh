#!/bin/bash

# 请根据你的实际密码替换
PGPASSWORD='xy123456'

PGHOST='db.ynnyhgjoifnukgnqcbua.supabase.co'
PGPORT='5432'
PGUSER='postgres'
PGDB='postgres'

DATA_DIR='/disk1/xy/graphtalk/openalex/output_v11_full'

echo "Starting import at $(date)"

psql "host=${PGHOST} port=${PGPORT} dbname=${PGDB} user=${PGUSER} password=${PGPASSWORD} sslmode=require" <<EOF
\copy universities FROM '${DATA_DIR}/universities.csv' CSV HEADER;
\copy research_topics FROM '${DATA_DIR}/research_topics.csv' CSV HEADER;
\copy candidates FROM '${DATA_DIR}/candidates.csv' CSV HEADER;
\copy publications FROM '${DATA_DIR}/publications.csv' CSV HEADER;
\copy candidate_topics FROM '${DATA_DIR}/candidate_topics.csv' CSV HEADER;
\copy academic_metrics FROM '${DATA_DIR}/academic_metrics.csv' CSV HEADER;
EOF

echo "Import finished at $(date)"
