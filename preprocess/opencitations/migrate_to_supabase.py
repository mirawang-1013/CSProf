import os
import json
import math
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values

# ========= 配置区域 =========
# 从环境变量读取 Supabase 连接信息（推荐）
PG_HOST = os.environ.get("SUPABASE_PGHOST",   "db.asmposagzzxbyzxrgghk.supabase.co")
PG_PORT = int(os.environ.get("SUPABASE_PGPORT", "5432"))
PG_DB   = os.environ.get("SUPABASE_DB",       "graphtalk")
PG_USER = os.environ.get("SUPABASE_USER",     "KidultXy")
PG_PASS = os.environ.get("SUPABASE_PASS",     "xy123456")

# 你的 CSV 路径（改成你自己的输出目录）
DATA_DIR = "/disk1/xy/graphtalk/openalex/test_output_v3_full_plus"
PATH_UNI  = os.path.join(DATA_DIR, "universities.csv")
PATH_CAND = os.path.join(DATA_DIR, "candidates.csv")
PATH_PUB  = os.path.join(DATA_DIR, "publications.csv")
PATH_RAD  = os.path.join(DATA_DIR, "radar_data.csv")

BATCH = 5000  # 批量插入大小


def connect():
    print("[INFO] Connecting to Supabase Postgres...")
    conn = psycopg2.connect(
        host=PG_HOST, port=PG_PORT, dbname=PG_DB, user=PG_USER, password=PG_PASS,
        sslmode="require"  # Supabase 需要 SSL
    )
    print("[OK] Connected.")
    return conn


def df_iter_batches(df: pd.DataFrame, batch_size=5000):
    n = len(df)
    for i in range(0, n, batch_size):
        yield df.iloc[i:i+batch_size]


def load_universities(conn):
    df = pd.read_csv(PATH_UNI)
    # 只取符合 schema 的列
    cols = ["id", "name", "ranking", "location", "created_at", "updated_at"]
    for c in cols:
        if c not in df.columns:
            df[c] = None
    df = df[cols]

    with conn.cursor() as cur:
        sql = """
        insert into universities (id, name, ranking, location, created_at, updated_at)
        values %s
        on conflict (id) do update set
            name = excluded.name,
            ranking = excluded.ranking,
            location = excluded.location,
            created_at = coalesce(universities.created_at, excluded.created_at),
            updated_at = excluded.updated_at;
        """
        inserted = 0
        for chunk in df_iter_batches(df, BATCH):
            values = [tuple(row) for row in chunk.itertuples(index=False, name=None)]
            execute_values(cur, sql, values)
            inserted += len(chunk)
        conn.commit()
    print(f"[OK] universities upserted: {inserted}")


def load_candidates(conn):
    df = pd.read_csv(PATH_CAND)
    cols = ["id","name","university_id","department","advisor","research_areas",
            "total_citations","h_index","graduation_year","email","website","ranking_score"]
    for c in cols:
        if c not in df.columns:
            df[c] = None
    df = df[cols]

    # 将 research_areas 从字符串/空值 → PG 数组
    def to_pg_array(x):
        if pd.isna(x) or x is None or str(x).strip() == "" or str(x).strip() == "[]":
            return []
        # 允许 JSON 或简单分隔
        try:
            val = json.loads(x) if isinstance(x, str) else x
            if isinstance(val, list):
                return val
        except Exception:
            pass
        # 兜底：按 ; 或 , 分拆
        s = str(x)
        parts = [p.strip() for p in s.replace(";", ",").split(",") if p.strip()]
        return parts

    df["research_areas"] = df["research_areas"].apply(to_pg_array)

    with conn.cursor() as cur:
        sql = """
        insert into candidates
        (id, name, university_id, department, advisor, research_areas,
         total_citations, h_index, graduation_year, email, website, ranking_score)
        values %s
        on conflict (id) do update set
          name = excluded.name,
          university_id = excluded.university_id,
          department = excluded.department,
          advisor = excluded.advisor,
          research_areas = excluded.research_areas,
          total_citations = excluded.total_citations,
          h_index = excluded.h_index,
          graduation_year = excluded.graduation_year,
          email = excluded.email,
          website = excluded.website,
          ranking_score = excluded.ranking_score;
        """
        inserted = 0
        for chunk in df_iter_batches(df, BATCH):
            values = [tuple(row) for row in chunk.itertuples(index=False, name=None)]
            execute_values(cur, sql, values)
            inserted += len(chunk)
        conn.commit()
    print(f"[OK] candidates upserted: {inserted}")


def load_publications(conn):
    # 安全解析：authors 是 JSON 字符串 → 转 TEXT[]；其余字段兜底
    df = pd.read_csv(
        PATH_PUB,
        on_bad_lines="skip",
        quotechar='"',
        escapechar='\\',
        engine="python"
    )

    cols = ["id","title","authors","venue","year","citations","type","candidate_id"]
    for c in cols:
        if c not in df.columns:
            df[c] = None
    df = df[cols]

    def authors_to_array(s):
        if pd.isna(s) or s is None or str(s).strip() == "":
            return []
        try:
            val = json.loads(s)
            if isinstance(val, list):
                return [str(x) for x in val]
        except Exception:
            pass
        # 如果不是 JSON，尽力分割
        txt = str(s)
        parts = [p.strip() for p in txt.split(",") if p.strip()]
        return parts

    df["authors"] = df["authors"].apply(authors_to_array)

    # year/citations 清洗
    def to_int_or_none(x):
        try:
            return int(x)
        except Exception:
            return None
    def to_int_or_zero(x):
        try:
            return int(x)
        except Exception:
            return 0

    df["year"] = df["year"].apply(to_int_or_none)
    df["citations"] = df["citations"].apply(to_int_or_zero)

    # 复合主键 upsert（id, candidate_id）
    with conn.cursor() as cur:
        sql = """
        insert into publications
        (id, title, authors, venue, year, citations, type, candidate_id)
        values %s
        on conflict (id, candidate_id) do update set
          title = excluded.title,
          authors = excluded.authors,
          venue = excluded.venue,
          year = excluded.year,
          citations = excluded.citations,
          type = excluded.type;
        """
        inserted = 0
        for chunk in df_iter_batches(df, BATCH):
            values = [tuple(row) for row in chunk.itertuples(index=False, name=None)]
            execute_values(cur, sql, values)
            inserted += len(chunk)
        conn.commit()
    print(f"[OK] publications upserted: {inserted}")


def load_radar(conn):
    df = pd.read_csv(PATH_RAD)
    cols = ["id","subject","value","full_mark","source","candidate_id"]
    for c in cols:
        if c not in df.columns:
            df[c] = None
    df = df[cols]

    with conn.cursor() as cur:
        sql = """
        insert into radar_data (id, subject, value, full_mark, source, candidate_id)
        values %s
        on conflict (id) do update set
          subject = excluded.subject,
          value = excluded.value,
          full_mark = excluded.full_mark,
          source = excluded.source,
          candidate_id = excluded.candidate_id;
        """
        inserted = 0
        for chunk in df_iter_batches(df, BATCH):
            values = [tuple(row) for row in chunk.itertuples(index=False, name=None)]
            execute_values(cur, sql, values)
            inserted += len(chunk)
        conn.commit()
    print(f"[OK] radar_data upserted: {inserted}")


def main():
    conn = connect()
    try:
        load_universities(conn)
        load_candidates(conn)
        load_publications(conn)
        load_radar(conn)
    finally:
        conn.close()
        print("✅ Migration finished.")

if __name__ == "__main__":
    main()
