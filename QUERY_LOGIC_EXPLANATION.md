# University Comparison Query Logic Explanation

## 1. Conference Distribution (会议分布)

### SQL 查询逻辑：

```sql
-- 步骤1: 获取大学ID
SELECT id, name FROM universities 
WHERE name IN ('University1', 'University2', ...);

-- 步骤2: 获取这些大学的候选人ID
SELECT id, university_id FROM candidates 
WHERE university_id IN (university_ids);

-- 步骤3: 获取这些候选人的发表文章
SELECT venue, year, candidate_id FROM publications 
WHERE candidate_id IN (candidate_ids)
  AND year >= startYear 
  AND year <= endYear;
```

### 处理逻辑：

1. **会议名称标准化**：使用 `normalizeConferenceName()` 函数将 venue 名称标准化
   - 例如：'ICML 2024' → 'ICML'
   - 例如：'NeurIPS Conference' → 'NeurIPS'
   - 支持的会议列表：ICML, NeurIPS, ICLR, AAAI, IJCAI, ACL, EMNLP, CVPR, ICCV, ECCV, SIGMOD, VLDB, KDD, WWW, CHI, UIST, USENIX, OSDI, SOSP, CCS, NDSS

2. **聚合统计**：
   - 按照会议名称分组
   - 按照大学分组
   - 统计每个大学在每个会议中的发表文章数量

3. **返回格式**：
   ```typescript
   [
     { conference: 'ICML', 'University1': 10, 'University2': 5 },
     { conference: 'NeurIPS', 'University1': 8, 'University2': 12 },
     ...
   ]
   ```

4. **排序和限制**：按总发表数排序，返回前12个会议

---

## 2. Emerging Topics (新兴主题)

### SQL 查询逻辑：

```sql
-- 步骤1: 获取大学ID
SELECT id, name FROM universities 
WHERE name IN ('University1', 'University2', ...);

-- 步骤2: 获取候选人和他们的研究兴趣
SELECT id, university_id, research_interests FROM candidates 
WHERE university_id IN (university_ids);

-- 步骤3: 获取这些候选人的发表文章
SELECT candidate_id, year FROM publications 
WHERE candidate_id IN (candidate_ids)
  AND year >= startYear 
  AND year <= endYear;
```

### 处理逻辑：

1. **预定义新兴主题列表**：
   - Large Language Models
   - Generative AI
   - Federated Learning
   - Edge Computing
   - Explainable AI
   - Neural Architecture Search
   - Graph Neural Networks
   - Multimodal Learning
   - Zero-Shot Learning
   - Sustainable Computing
   - Foundation Models
   - Transformers
   - Diffusion Models
   - Prompt Engineering
   - Reinforcement Learning from Human Feedback

2. **模糊匹配**：
   - 遍历每个候选人的 `research_interests` 数组
   - 检查是否包含任何新兴主题的关键词
   - 匹配规则：`topic.toLowerCase().includes(emergingTopic.toLowerCase())` 或反向包含

3. **统计逻辑**：
   - 对于每篇发表文章，检查其作者的研究兴趣
   - 如果研究兴趣匹配新兴主题，则将该文章计入该主题
   - 按大学分组统计

4. **返回格式**：
   ```typescript
   [
     { topic: 'Large Language Models', 'University1': 25, 'University2': 18 },
     { topic: 'Generative AI', 'University1': 15, 'University2': 20 },
     ...
   ]
   ```

5. **排序和限制**：按总发表数排序，返回前8个主题

---

## 3. Topic Heatmap (主题热力图)

### SQL 查询逻辑：

```sql
-- 步骤1: 获取大学ID
SELECT id, name FROM universities 
WHERE name IN ('University1', 'University2', ...);

-- 步骤2: 获取候选人和他们的研究兴趣
SELECT id, university_id, research_interests FROM candidates 
WHERE university_id IN (university_ids);

-- 步骤3: 获取这些候选人的发表文章
SELECT candidate_id, year FROM publications 
WHERE candidate_id IN (candidate_ids)
  AND year >= startYear 
  AND year <= endYear;
```

### 处理逻辑：

1. **数据结构**：
   - 三级 Map 结构：`university -> year -> topic -> count`
   - 例如：`{ 'NUS': { '2020': { 'Machine Learning': 5, 'NLP': 3 }, '2021': { 'Machine Learning': 8 } } }`

2. **文章分配**：
   - 对于每篇发表文章，将其分配给作者的所有研究兴趣
   - 例如：如果一篇文章的作者有3个研究兴趣 ['ML', 'NLP', 'CV']，则这篇文章会在3个主题中各计1次
   - **注意**：这是加权分配，不是唯一分配

3. **坐标计算**：
   - `x`: 年份索引 (0, 1, 2, ...)
   - `y`: 主题索引 (0, 1, 2, ...)
   - `z`: 论文数量（用于热力图颜色强度）

4. **返回格式**：
   ```typescript
   [
     { year: '2020', topic: 'Machine Learning', papers: 5, university: 'NUS', x: 0, y: 0, z: 5 },
     { year: '2020', topic: 'NLP', papers: 3, university: 'NUS', x: 0, y: 1, z: 3 },
     { year: '2021', topic: 'Machine Learning', papers: 8, university: 'NUS', x: 1, y: 0, z: 8 },
     ...
   ]
   ```

### Heatmap 可视化计算（KeywordHeatmap.tsx）：

1. **选择两个大学进行比较**：University A 和 University B

2. **计算差异**：
   ```typescript
   difference = papers_A - papers_B
   ```
   - 正数：University A 在该主题/年份有更多发表
   - 负数：University B 在该主题/年份有更多发表
   - 零：两者相等

3. **颜色映射**：
   - **绿色系**（University A 更多）：
     - 浅绿 (#d1fae5): 差异 < 20%
     - 中绿 (#10b981): 差异 40-60%
     - 深绿 (#047857): 差异 > 80%
   - **红色系**（University B 更多）：
     - 浅红 (#fee2e2): 差异 < 20%
     - 中红 (#ef4444): 差异 40-60%
     - 深红 (#b91c1c): 差异 > 80%
   - **灰色**：差异为0

4. **过滤功能**：可以使用滑块过滤显示特定差异范围的数据点

---

## 数据表结构总结

### publications 表（核心数据）：
- `id`: 论文ID
- `candidate_id`: 候选人ID（关联到 candidates 表）
- `venue`: 发表会议/期刊名称
- `year`: 发表年份
- `citations`: 引用数
- `title`: 论文标题

### candidates 表：
- `id`: 候选人ID
- `university_id`: 大学ID（关联到 universities 表）
- `research_interests`: 研究兴趣数组（TEXT[]）

### universities 表：
- `id`: 大学ID
- `name`: 大学名称
- `ranking`: 排名

### academic_metrics 表（聚合数据）：
- `university_id`: 大学ID
- `year`: 年份
- `publications_count`: 发表文章数量
- `total_citations`: 总引用数

---

## 注意事项

1. **Conference Distribution**：
   - 只统计标准化的会议名称（通过 `normalizeConferenceName()` 函数）
   - 如果 venue 名称不匹配任何已知模式，该文章不会被统计

2. **Emerging Topics**：
   - 使用模糊匹配，可能有一些误匹配
   - 一篇文章可能被计入多个主题（如果作者有多个匹配的研究兴趣）

3. **Topic Heatmap**：
   - 一篇文章会被分配给作者的所有研究兴趣
   - 这意味着如果一篇文章的作者有3个研究兴趣，这篇文章会在热力图中出现3次
   - 这是设计如此，用于展示每个主题的研究活跃度

4. **性能考虑**：
   - 所有查询都是客户端查询，没有使用数据库视图或存储过程
   - 如果数据量大，可能需要优化查询或添加缓存

