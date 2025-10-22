import requests
import pandas as pd
import io
import os

def download_csranks_files(save_dir="csrankings_raw"):
    os.makedirs(save_dir, exist_ok=True)
    base = "https://raw.githubusercontent.com/emeryberger/CSrankings/gh-pages/"
    letters = [chr(c) for c in range(ord('a'), ord('z')+1)]
    dfs = []
    for letter in letters:
        fname = f"csrankings-{letter}.csv"
        url = base + fname
        try:
            resp = requests.get(url, timeout=10)
        except Exception as e:
            print("Error fetching", fname, e)
            continue
        if resp.status_code == 200:
            print("Downloaded:", fname)
            df = pd.read_csv(io.StringIO(resp.text))
            df["source_file"] = fname
            dfs.append(df)
            # Optionally save raw copy
            df.to_csv(os.path.join(save_dir, fname), index=False)
        else:
            print("Skip:", fname, "status", resp.status_code)
    return dfs

def unify_and_clean(dfs):
    df_all = pd.concat(dfs, ignore_index=True)
    print("Combined columns:", df_all.columns.tolist())
    # Choose columns present
    # Many csrankings CSVs include: name, affiliation, dept, homepage, scholarid, areas, etc.
    # We care: name → author_name, affiliation → university_name
    # Optionally include dept/homepage if exist.
    ex = df_all.columns
    keep = []
    if "name" in ex:
        keep.append("name")
    if "affiliation" in ex:
        keep.append("affiliation")
    if "dept" in ex:
        keep.append("dept")
    if "homepage" in ex:
        keep.append("homepage")
    keep.append("source_file")
    df_sel = df_all[keep].copy()
    rename = {
        "name": "author_name",
        "affiliation": "university_name",
        "dept": "department",
        "homepage": "homepage"
    }
    df_sel = df_sel.rename(columns=rename)
    # Drop rows without affiliation
    df_sel = df_sel[df_sel["university_name"].notna()]
    # Trim whitespace
    df_sel["author_name"] = df_sel["author_name"].str.strip()
    df_sel["university_name"] = df_sel["university_name"].str.strip()
    # Deduplicate: same author_name, choose first
    df_sel = df_sel.drop_duplicates(subset=["author_name"], keep="first").reset_index(drop=True)
    return df_sel

def save_affiliation_csv(df, out_path="csranks_author_affiliations.csv"):
    df.to_csv(out_path, index=False, encoding="utf-8")
    print("Saved to", out_path, "rows:", len(df))

if __name__ == "__main__":
    dfs = download_csranks_files()
    if not dfs:
        raise RuntimeError("No CSRankings files downloaded")
    df_aff = unify_and_clean(dfs)
    save_affiliation_csv(df_aff)
