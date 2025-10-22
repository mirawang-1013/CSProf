#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_clean_dataset_chunked_v11.2_full.py
----------------------------------------
Final production-stable version (Supabase-ready)

✅ 6-table schema output:
   - universities.csv
   - candidates.csv
   - publications.csv
   - academic_metrics.csv
   - research_topics.csv
   - candidate_topics.csv
✅ Fully CSV-quoted (quoting=csv.QUOTE_ALL)
✅ Coauthor-based university inference
✅ Graduation year = first_pub_year + 5
✅ Region map support (via --region)
✅ Includes 'Unknown University' to avoid FK errors
"""

import os, re, json, argparse, csv
from uuid import uuid5, NAMESPACE_URL
from datetime import datetime
from collections import Counter, defaultdict
import pandas as pd

# =============================================================
# Utilities
# =============================================================
def stable_uuid(*parts):
    return str(uuid5(NAMESPACE_URL, "||".join(map(str, parts))))

def normalize_name(name: str) -> str:
    if not isinstance(name, str):
        return ""
    s = re.sub(r"\[.*?\]", "", name.strip())
    s = re.sub(r"\b\d{4}\b", "", s)
    s = re.sub(r"\s+", " ", s).lower().strip()
    if "," in s:
        parts = [p.strip() for p in s.split(",")]
        if len(parts) == 2:
            s = f"{parts[1]} {parts[0]}"
    return s.strip()

def parse_authors(raw: str):
    if not isinstance(raw, str) or not raw.strip():
        return [], []
    parts = [p.strip() for p in re.split(r";", raw) if p.strip()]
    normed, rawed = [], []
    for p in parts:
        normed.append(normalize_name(p))
        rawed.append(p)
    return normed, rawed

def year_from_date(s: str):
    if not isinstance(s, str):
        return None
    m = re.search(r"(19|20)\d{2}", s)
    return int(m.group()) if m else None

# =============================================================
# Metrics
# =============================================================
def compute_h_index(citations):
    arr = sorted([int(max(0, c)) for c in citations], reverse=True)
    return max((i for i, c in enumerate(arr, 1) if c >= i), default=0)

def calc_scores(total_citations, h_index, publication_count):
    citation_score = min(total_citations / 10.0, 100.0)
    h_index_score = min(h_index * 12.0, 100.0)
    publication_score = min(publication_count * 15.0, 100.0)
    avg_cit = (total_citations / publication_count) if publication_count > 0 else 0
    impact_score = min(avg_cit / 3.0, 100.0)
    ranking_score = int(round(
        citation_score * 0.35 + h_index_score * 0.25 + publication_score * 0.25 + impact_score * 0.15
    ))
    return ranking_score

# =============================================================
# Topic detection
# =============================================================
TOPIC_KEYWORDS = {
    "machine learning": ["machine learning", "ml", "classification"],
    "deep learning": ["neural network", "cnn", "transformer"],
    "natural language processing": ["nlp", "bert", "language model"],
    "computer vision": ["image", "vision", "object detection"],
    "reinforcement learning": ["reinforcement", "policy", "q-learning"],
    "data mining": ["clustering", "graph", "network"],
}

def detect_topic(text):
    if not isinstance(text, str):
        return "other"
    s = text.lower()
    for topic, kws in TOPIC_KEYWORDS.items():
        if any(kw in s for kw in kws):
            return topic
    return "other"

# =============================================================
# University matching
# =============================================================
def load_alias_map(alias_json_path):
    with open(alias_json_path, "r") as f:
        alias_map = json.load(f)
    return {k.lower().strip(): v for k, v in alias_map.items()}

def load_region_map(region_json_path):
    if not region_json_path or not os.path.exists(region_json_path):
        print("[WARN] Region map not found, using 'unknown'")
        return {}
    with open(region_json_path, "r") as f:
        region_map = json.load(f)
    return {k.strip(): v.strip() for k, v in region_map.items()}

def load_csranks_map(csv_path):
    df = pd.read_csv(csv_path)
    df.columns = [c.strip().lower() for c in df.columns]
    df["author_name"] = df["author_name"].astype(str).apply(normalize_name)
    df["university_name"] = df["university_name"].astype(str).str.strip()
    return dict(zip(df["author_name"], df["university_name"]))

def fuzzy_match(name, csr_map, alias_map):
    if not name:
        return ""
    variants = [name, name.replace(".", ""), " ".join(name.split()[::-1])]
    for v in variants:
        if v in csr_map:
            return csr_map[v]
    for k, v in alias_map.items():
        if k in name or name in k:
            return v
    return ""

# =============================================================
# Pass 1
# =============================================================
def pass1(meta_path, chunksize, yrmin, yrmax):
    author_first = {}
    for chunk in pd.read_csv(meta_path, chunksize=chunksize, low_memory=False):
        chunk.columns = [c.lower().strip() for c in chunk.columns]
        for _, r in chunk.iterrows():
            normed, _ = parse_authors(r.get("author", ""))
            y = year_from_date(str(r.get("pub_date", "")))
            if y:
                for a in normed:
                    author_first[a] = min(y, author_first.get(a, y))
    return {a for a, y in author_first.items() if yrmin <= y <= yrmax}

# =============================================================
# Pass 2
# =============================================================
def pass2(meta_path, chunksize, pool, out_dir):
    pubs_path = os.path.join(out_dir, "publications.csv")
    with open(pubs_path, "w", newline='') as f:
        writer = csv.writer(f, quoting=csv.QUOTE_ALL)
        writer.writerow(["id","candidate_id","title","venue","year","citations","doi","abstract","topic_id","created_at","updated_at"])

    per_cand = defaultdict(lambda: {"cit": [], "topics": [], "coauthors": set(), "first_year": None})

    for chunk in pd.read_csv(meta_path, chunksize=chunksize, low_memory=False):
        chunk.columns = [c.lower().strip() for c in chunk.columns]
        for _, r in chunk.iterrows():
            normed, _ = parse_authors(r.get("author", ""))
            inter = [a for a in normed if a in pool]
            if not inter:
                continue
            year = year_from_date(str(r.get("pub_date", "")))
            citations = int(r.get("citation_count", 0) or 0)
            topic_name = detect_topic(f"{r.get('title','')} {r.get('abstract','')}")
            topic_id = stable_uuid("topic", topic_name)

            for a in inter:
                cid = stable_uuid("candidate", a)
                pub_id = stable_uuid("pub", r.get("id", ""), a)
                with open(pubs_path, "a", newline='') as f:
                    writer = csv.writer(f, quoting=csv.QUOTE_ALL)
                    writer.writerow([
                        pub_id, cid, r.get("title",""), r.get("venue",""), year or "",
                        citations, r.get("doi",""), r.get("abstract",""),
                        topic_id, datetime.utcnow().isoformat(), datetime.utcnow().isoformat()
                    ])
                d = per_cand[cid]
                d["cit"].append(citations)
                d["topics"].append(topic_name)
                d["coauthors"].update(normed)
                if year and (d["first_year"] is None or year < d["first_year"]):
                    d["first_year"] = year
    return per_cand

# =============================================================
# Finalize outputs
# =============================================================
def finalize(per_cand, csr_map, alias_map, out_dir, region_map):
    CURRENT_YEAR = datetime.utcnow().year
    cand_rows, universities, topic_dict = [], {}, {}

    for cid, d in per_cand.items():
        name = cid.split("||")[-1]
        total = sum(d["cit"])
        h = compute_h_index(d["cit"])
        pub_cnt = len(d["cit"])

        co_uni_counter = Counter()
        for co in d["coauthors"]:
            if co == name:
                continue
            co_uni = fuzzy_match(co, csr_map, alias_map)
            if co_uni:
                co_uni_counter[co_uni] += 1
        uni = co_uni_counter.most_common(1)[0][0] if co_uni_counter else "Unknown University"
        uni_id = stable_uuid("university", uni)
        universities[uni_id] = uni

        first_pub = d.get("first_year", CURRENT_YEAR)
        graduation_year = (first_pub + 5) if first_pub else CURRENT_YEAR

        top3 = [t for t, _ in Counter(d["topics"]).most_common(3)]
        research_interests = "; ".join(top3)
        for t in top3:
            topic_dict[t] = stable_uuid("topic", t)

        cand_rows.append({
            "id": cid,
            "name": name,
            "university_id": uni_id,
            "graduation_year": graduation_year,
            "total_citations": total,
            "h_index": h,
            "research_interests": research_interests,
            "profile_image_url": "",
            "linkedin_url": "",
            "google_scholar_url": "",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        })

    # Write all tables with quoting
    df_cand = pd.DataFrame(cand_rows)
    df_cand.to_csv(os.path.join(out_dir, "candidates.csv"), index=False, quoting=csv.QUOTE_ALL)

    uni_rows = [{
        "id": uid,
        "name": uname,
        "country": region_map.get(uname, "unknown"),
        "ranking": None,
        "logo_url": "",
        "website": "",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    } for uid, uname in universities.items()]
    pd.DataFrame(uni_rows).to_csv(os.path.join(out_dir, "universities.csv"), index=False, quoting=csv.QUOTE_ALL)

    metrics_rows = [{
        "id": stable_uuid("academic_metrics", uid, CURRENT_YEAR),
        "university_id": uid,
        "year": CURRENT_YEAR,
        "publications_count": int(grp.shape[0]),
        "total_citations": int(grp["total_citations"].sum()),
        "h_index_avg": float(grp["h_index"].mean()),
        "conference_papers": 0,
        "journal_papers": 0,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    } for uid, grp in df_cand.groupby("university_id")]
    pd.DataFrame(metrics_rows).to_csv(os.path.join(out_dir, "academic_metrics.csv"), index=False, quoting=csv.QUOTE_ALL)

    pd.DataFrame([{
        "id": tid,
        "name": t,
        "description": "",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    } for t, tid in topic_dict.items()]).to_csv(os.path.join(out_dir, "research_topics.csv"), index=False, quoting=csv.QUOTE_ALL)

    cand_topic_rows = []
    for _, r in df_cand.iterrows():
        topics = [t.strip() for t in r["research_interests"].split(";") if t.strip()]
        for t in topics:
            tid = topic_dict.get(t)
            if tid:
                cand_topic_rows.append({
                    "candidate_id": r["id"],
                    "topic_id": tid,
                    "created_at": datetime.utcnow().isoformat(),
                })
    pd.DataFrame(cand_topic_rows).to_csv(os.path.join(out_dir, "candidate_topics.csv"), index=False, quoting=csv.QUOTE_ALL)

    with open(os.path.join(out_dir, "RUN_SUMMARY.json"), "w") as f:
        json.dump({
            "candidates": len(df_cand),
            "universities": len(uni_rows),
            "topics": len(topic_dict),
            "generated_at": datetime.utcnow().isoformat()
        }, f, indent=2)
    print("[DONE] build_clean_dataset_chunked_v11.2_full.py finished successfully.")

# =============================================================
# Entry
# =============================================================
def run(meta, csr, alias_json, region_json, out_dir, chunksize, yrmin, yrmax):
    os.makedirs(out_dir, exist_ok=True)
    alias_map = load_alias_map(alias_json)
    csr_map = load_csranks_map(csr)
    region_map = load_region_map(region_json)
    pool = pass1(meta, chunksize, yrmin, yrmax)
    per_cand = pass2(meta, chunksize, pool, out_dir)
    finalize(per_cand, csr_map, alias_map, out_dir, region_map)

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--meta", required=True)
    ap.add_argument("--csrank", required=True)
    ap.add_argument("--alias", required=True)
    ap.add_argument("--region", required=False)
    ap.add_argument("--out-dir", required=True)
    ap.add_argument("--chunksize", type=int, default=500000)
    ap.add_argument("--student-first-year-min", type=int, default=2017)
    ap.add_argument("--student-first-year-max", type=int, default=2022)
    args = ap.parse_args()
    run(args.meta, args.csrank, args.alias, args.region, args.out_dir, args.chunksize,
        args.student_first_year_min, args.student_first_year_max)
