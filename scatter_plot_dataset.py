from pymongo import MongoClient
from collections import Counter

# 连接数据库
client = MongoClient('mongodb://localhost:27017/')
db = client['IDEA_dataset']

# 集合引用
users_sim_cluster = db['users_sim_cluster']
users_integrated = db['users_integrated']
users_raw_data = db['users_raw_data']
processed_data = db['processed_data_update']

# # 检查 primaryCategory 的分布
# categories = users_integrated.find({}, {"views.primaryCategory": 1})
# all_categories = [view.get('primaryCategory', 'Unknown') for user in categories for view in user.get('views', [])]
# print(Counter(all_categories))


# 定义目标分类列表
target_categories = {
    "business", "crime", "entertainment&arts", "football", "health",
    "lifeandstyle", "politics", "science", "sport", "technology",
    "uk news", "world news", "environment", "others"
}

news_categories = {
    "news", "News"
}

# 清空旧数据
processed_data.delete_many({})

# 遍历 users_sim_cluster，逐个用户处理数据
for user in users_sim_cluster.find({}):
    informfully_id = user['informfully_id']
    cluster = user.get('cluster', 'Unknown')

    # 从 user_raw_data 查找未标准化的值
    raw_user = users_raw_data.find_one({"informfully_id": informfully_id})
    avg_duration = raw_user.get('avg_duration', 0) if raw_user else 0
    avg_maxscroll = raw_user.get('avg_maxscroll', 0) if raw_user else 0

    # 从 users_integrated 查找主要分类
    integrated_user = users_integrated.find_one({"informfully_id": informfully_id})
    if integrated_user:
        # 统计 views 中分类出现频率
        categories = []
        for view in integrated_user.get('views', []):
            category = view.get('primaryCategory', 'Unknown')
            if category is not None:
                category = category.lower()  # 转换为小写
            else:
                category = 'unknown'  # 如果为 None，则设为 "unknown"

            # 将 news 相关分类归类为 world news
            if category in news_categories:
                category = 'world news'
            elif category not in target_categories:  # 非目标分类时归为 others
                category = 'others'

            categories.append(category)

        # 统计分类出现频率
        category_counts = Counter(categories)
        primary_category = category_counts.most_common(1)[0][0] if category_counts else "unknown"
    else:
        primary_category = "unknown"

    print(f"Processed {informfully_id}: primary_category = {primary_category}")


    # 插入数据到 processed_data
    processed_data.insert_one({
        "informfully_id": informfully_id,
        "cluster": cluster,
        "avg_duration": avg_duration,
        "avg_maxscroll": avg_maxscroll,
        "primary_category": primary_category
    })

print("数据已成功处理并存入新集合 processed_data")
