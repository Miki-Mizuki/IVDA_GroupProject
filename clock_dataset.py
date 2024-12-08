from pymongo import MongoClient

# MongoDB 连接
client = MongoClient('mongodb://localhost:27017/')
db = client['IDEA_dataset']

# 现有的集合
users_collection_sc = db['users_sim_cluster']  # sim cluster 集合
users_collection_raw = db['users_raw_data']  # raw data 集合

# 新的集合
users_time_distribution = db['users_time_distribution']  # 新集合

def generate_time_distribution_data():
    """
    Combine raw data and standardized data into a new collection.
    """
    # 清空旧集合
    users_time_distribution.delete_many({})
    print("Old collection cleared.")

    # 获取数据
    print("Fetching data from collections...")
    clusters = list(users_collection_sc.find({}))
    raw_data = {
        doc['informfully_id']: doc
        for doc in users_collection_raw.find({}, {
            "informfully_id": 1,
            "avg_duration": 1,
            "avg_maxscroll": 1,
            "avg_weekday_time_accessing_article": 1,
            "var_weekday_time_accessing_article": 1,
            "rush_hour": 1,
            "bedtime": 1,
            "work_hour": 1,
            "weekend": 1,
            "shallow": 1,
            "medium": 1,
            "deep": 1
        })
    }

    print(f"Fetched {len(clusters)} clusters and {len(raw_data)} raw data entries.")

    success_count = 0

    for cluster in clusters:
        informfully_id = cluster.get('informfully_id')
        raw_entry = raw_data.get(informfully_id)

        if raw_entry:
            # 新字段计算（标准化前）
            avg_time_per_scroll = raw_entry.get("avg_duration", 0) / (raw_entry.get("avg_maxscroll", 1) or 1)

            # 合并数据，包含 `sim cluster` 的所有列
            combined_entry = {**cluster}  # 复制 `sim cluster` 的所有列
            combined_entry.update({
                "avg_duration": raw_entry.get("avg_duration", 0),  # 标准化前
                "avg_maxscroll": raw_entry.get("avg_maxscroll", 0),
                "avg_time_per_scroll": avg_time_per_scroll,
                "avg_weekday_time_accessing_article": raw_entry.get("avg_weekday_time_accessing_article", 0),
                "var_weekday_time_accessing_article": raw_entry.get("var_weekday_time_accessing_article", 0),
                "rush_hour": raw_entry.get("rush_hour", False),
                "bedtime": raw_entry.get("bedtime", False),
                "work_hour": raw_entry.get("work_hour", False),
                "weekend": raw_entry.get("weekend", False),
                "shallow": raw_entry.get("shallow", 0),
                "medium": raw_entry.get("medium", 0),
                "deep": raw_entry.get("deep", 0)
            })

            # 插入到新集合
            users_time_distribution.insert_one(combined_entry)
            success_count += 1
        else:
            print(f"Warning: No raw data found for informfully_id: {informfully_id}")

    print(f"Data generation complete. {success_count}/{len(clusters)} entries successfully processed.")

    # 验证结果
    total_entries = users_time_distribution.count_documents({})
    print(f"Total entries in 'users_time_distribution': {total_entries}")

    # 示例数据打印
    if total_entries > 0:
        example_entry = users_time_distribution.find_one({})
        print(f"Sample entry: {example_entry}")

if __name__ == "__main__":
    generate_time_distribution_data()
