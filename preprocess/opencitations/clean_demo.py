#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
sample_meta_large_v2.py
--------------------------------
针对亿级 OpenAlex CSV 优化：
✅ 不再因零样本提前结束
✅ 完全流式读取，支持超大文件
✅ 优先取 citation_count > 0，不足则补零
✅ 带详细日志打印
"""

import pandas as pd
from datetime import datetime

def sample_meta(in_path, out_path_demo, out_path_full, target_demo=100, target_full=10000, chunksize=200000):
    print(f"[{datetime.now().isoformat()}] 🚀 开始抽样：{in_path}")
    print(f"  - 每块读取 {chunksize:,} 行")
    print(f"  - demo 样本 {target_demo} 行，完整样本 {target_full} 行")

    samples_nonzero, samples_zero = [], []
    total_rows, total_nonzero, total_zero = 0, 0, 0

    # 分块读取大文件
    for chunk_idx, chunk in enumerate(pd.read_csv(in_path, chunksize=chunksize, dtype=str, low_memory=False)):
        total_rows += len(chunk)
        chunk["citation_count"] = pd.to_numeric(chunk["citation_count"], errors="coerce")

        nonzero = chunk[chunk["citation_count"] > 0]
        zero = chunk[chunk["citation_count"] == 0]

        total_nonzero += len(nonzero)
        total_zero += len(zero)

        # 累积样本
        if len(nonzero) > 0:
            samples_nonzero.append(nonzero)
        if len(zero) > 0 and len(samples_zero) < target_full * 3:
            samples_zero.append(zero)

        if chunk_idx % 20 == 0:
            print(f"[Chunk {chunk_idx}] processed {total_rows:,} rows | nonzero={total_nonzero:,}, zero={total_zero:,}")

        # ✅ 只在非零样本够了才提前结束
        if total_nonzero >= target_full * 1.2:
            print(f"[Break] 已收集足够非零样本 ({total_nonzero:,})，提前结束。")
            break

    print(f"[Combine] nonzero={sum(len(x) for x in samples_nonzero):,}, zero={sum(len(x) for x in samples_zero):,}")

    # 合并
    df_nonzero = pd.concat(samples_nonzero) if samples_nonzero else pd.DataFrame()
    df_zero = pd.concat(samples_zero) if samples_zero else pd.DataFrame()

    # Demo 样本
    df_demo = df_nonzero.head(target_demo) if len(df_nonzero) >= target_demo else \
               pd.concat([df_nonzero, df_zero.head(target_demo - len(df_nonzero))])
    df_demo.to_csv(out_path_demo, index=False)
    print(f"[✅ Demo] 已写出 {len(df_demo):,} 行 → {out_path_demo}")

    # Full 样本
    if len(df_nonzero) >= target_full:
        df_full = df_nonzero.sample(n=target_full, random_state=42)
    else:
        remaining = target_full - len(df_nonzero)
        df_full = pd.concat([
            df_nonzero,
            df_zero.sample(n=min(remaining, len(df_zero)), random_state=42)
        ])
    df_full = df_full.head(target_full)
    df_full.to_csv(out_path_full, index=False)

    # 统计
    nonzero_count = (df_full["citation_count"] > 0).sum()
    zero_count = (df_full["citation_count"] == 0).sum()
    missing_count = df_full["citation_count"].isna().sum()

    print(f"[✅ Full] 已写出 {len(df_full):,} 行 → {out_path_full}")
    print("\n📊 抽样统计：")
    print(f"  总样本：{len(df_full):,}")
    print(f"  citation_count > 0 ：{nonzero_count:,}")
    print(f"  citation_count == 0 ：{zero_count:,}")
    print(f"  citation_count 缺失 ：{missing_count:,}")
    print(f"[{datetime.now().isoformat()}] ✅ 抽样任务完成。")

if __name__ == "__main__":
    in_path = "/disk1/xy/graphtalk/openalex/paper_citation_summary.csv"
    out_path_demo = "/disk1/xy/graphtalk/openalex/test_meta_demo.csv"
    out_path_full = "/disk1/xy/graphtalk/openalex/test_meta_new.csv"
    sample_meta(in_path, out_path_demo, out_path_full, target_demo=100, target_full=10000, chunksize=200000)
