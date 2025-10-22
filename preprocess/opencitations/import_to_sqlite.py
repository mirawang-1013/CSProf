import os
import json
import csv
import sqlite3
from datetime import datetime
import pandas as pd

# === 路径配置（按你的实际输出目录改） ===
DATA_DIR = "/disk1/xy/graphtalk/openalex/test_output_v3_full_plus"
DB_PATH = os.path.join(DATA_DIR, "graphtalk.db")
PATH_UNI  = os.path.join(DATA_DIR, "universities.csv")
PATH_CAND = os.path.join(DATA_DIR, "candidates.csv")
PATH_PUB  = os.path.join(DATA_DIR, "publications.csv")
PATH_RAD  = os.path.join(DATA_DIR, "radar_data.csv")
PATH_SUM  = os.path.join(DATA_DIR, "RUN_SUMMARY.json")

# === 建表（对齐你给的 schema，并补充生成列） ===
DDL = """
PRAGMA journal_mode=WAL;
PRAGMA synchronous=NORMAL;

CREATE TABLE IF NOT EXISTS universities (
    id TEXT PRIMARY KEY,
    name TEXT,
    candidate_count INTEGER,   -- 来自生成产物
    ranking INTEGER,
    location TEXT,
    created_at TEXT,
    updated_at TEXT
);

CREATE TABLE IF NOT EXISTS candidates (
    id TEXT PRIMARY KEY,
    name TEXT,
    name_display TEXT,         -- 生成产物中用于展示
    university_id TEXT,
    department TEXT,
    advisor TEXT,
    research_areas TEXT,       -- 用 TEXT 存储 JSON 数组（SQLite无原生数组）
    total_citations INTEGER,
    h_index INTEGER,
    graduation_year INTEGER,
    email TEXT,
    website TEXT,
    ranking_score INTEGER,
    publication_count INTEGER, -- 生成产物中已有
    FOREIGN KEY(university_id) REFERENCES universities(id)
);

-- 复合主键：同一paper可对应多个candidate
CREATE TABLE IF NOT EXISTS publications (
    id TEXT,
    title TEXT,
    authors TEXT,      -- JSON数组原样存文本
    venue TEXT,
    year INTEGER,
    citations INTEGER,
    type TEXT,
    candidate_id TEXT,
    PRIMARY KEY (id, candidate_id),
    FOREIGN KEY(candidate_id) REFERENCES candidates(id)
);

CREATE TABLE IF NOT EXISTS radar_data (
    id TEXT PRIMARY KEY,
    subject TEXT,
    value INTEGER,
    full_mark INTEGER,
    source TEXT,
    candidate_id TEXT,
    FOREIGN KEY(candidate_id) REFERENCES candidates(id)
);

CREATE TABLE IF NOT EXISTS candidate_analysis (
    id TEXT PRIMARY KEY,
    bio TEXT,
    research_summary TEXT,
    score_explanation TEXT,  -- JSONB in PG, 这里用 TEXT
    key_strengths TEXT,
    potential_concerns TEXT,
    candidate_id TEXT,
    FOREIGN KEY(candidate_id) REFERENCES candidates(id)
);
"""

def connect():
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    conn = sqlite3.connect(DB_PATH)
    conn.executescript(DDL)
    return conn

def insert_dataframe(conn, table, df):
    # 将 NaN → None
    df = df.where(pd.notnull(df), None)
    # 直接批量插入
    df.to_sql(table, conn, if_exists="append", index=False)

def load_universities(conn):
    df = pd.read_csv(PATH_UNI)
    # 填补 schema 中的字段
    if "candidate_count" not in df.columns:
        df["candidate_count"] = None
    if "ranking" not in df.columns:
        df["ranking"] = None
    if "location" not in df.columns:
        df["location"] = None
    if "created_at" not in df.columns:
        df["created_at"] = datetime.utcnow().isoformat()
    df["updated_at"] = datetime.utcnow().isoformat()
    insert_dataframe(conn, "universities", df)
    print(f"[OK] universities: {len(df)}")

def load_candidates(conn):
    df = pd.read_csv(PATH_CAND)
    # 对齐 schema：补齐缺少的列
    for col in ["department","advisor","research_areas","graduation_year","email","website"]:
        if col not in df.columns:
            df[col] = None
    if "name_display" not in df.columns:
        df["name_display"] = df["name"]  # 回退
    if "publication_count" not in df.columns:
        df["publication_count"] = None
    insert_dataframe(conn, "candidates", df)
    print(f"[OK] candidates: {len(df)}")

def load_publications_streaming(conn, chunksize=100_000):
    cur = conn.cursor()
    # 使用 Python csv 流式读取，避免 pandas 解析器在复杂引号/逗号时爆炸
    count, dropped = 0, 0
    with open(PATH_PUB, "r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        batch = []
        for row in reader:
            # 规范化/容错
            pid = row.get("id","")
            cid = row.get("candidate_id","")
            if not pid or not cid:
                dropped += 1
                continue
            title = (row.get("title") or "").strip()
            authors = (row.get("authors") or "[]").strip()
            venue = (row.get("venue") or "").strip()
            year = row.get("year") or None
            citations = row.get("citations") or 0
            ptype = (row.get("type") or "").strip()

            batch.append((pid, title, authors, venue, int(year) if str(year).isdigit() else None,
                          int(citations) if str(citations).isdigit() else 0, ptype, cid))

            if len(batch) >= chunksize:
                cur.executemany(
                    "INSERT OR IGNORE INTO publications "
                    "(id,title,authors,venue,year,citations,type,candidate_id) "
                    "VALUES (?,?,?,?,?,?,?,?)", batch)
                conn.commit()
                count += len(batch)
                print(f"[PUB] inserted {count} (+{len(batch)})")
                batch = []
        if batch:
            cur.executemany(
                "INSERT OR IGNORE INTO publications "
                "(id,title,authors,venue,year,citations,type,candidate_id) "
                "VALUES (?,?,?,?,?,?,?,?)", batch)
            conn.commit()
            count += len(batch)
    print(f"[OK] publications: {count} (ignored duplicates: {dropped})")

def load_radar(conn):
    df = pd.read_csv(PATH_RAD)
    if "source" not in df.columns:
        df["source"] = "Computed from publication metrics"
    insert_dataframe(conn, "radar_data", df)
    print(f"[OK] radar_data: {len(df)}")

def print_summary():
    if os.path.exists(PATH_SUM):
        with open(PATH_SUM, "r") as f:
            s = json.load(f)
        print("[SUMMARY]", json.dumps(s, indent=2, ensure_ascii=False))
    else:
        print("[SUMMARY] RUN_SUMMARY.json not found")

def main():
    print(f"[INFO] SQLite DB: {DB_PATH}")
    conn = connect()
    load_universities(conn)
    load_candidates(conn)
    load_publications_streaming(conn, chunksize=100000)
    load_radar(conn)
    conn.close()
    print_summary()
    print("✅ DONE")

if __name__ == "__main__":
    main()
