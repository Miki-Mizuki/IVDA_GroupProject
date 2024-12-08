from pymongo import MongoClient
from typing import List, Optional
from bson import ObjectId
import numpy as np
import pandas as pd

class Bookmark: 
    '''
    Consider the number of bookmarks a user has made to articles
    '''
    def __init__(self, data):
        self.id = str(data.get('_id', ''))
        self.articleId = data.get('articleId', '')
        self.createdAt = data.get('createdAt', '')
        self.articlePublishedDate = data.get('articlePublishedDate', '')
        self.removedAt = data.get('removedAt', None)

    def to_json(self):
        return {
            "id": self.id,
            "articleId": self.articleId,
            "createdAt": self.createdAt,
            "articlePublishedDate": self.articlePublishedDate,
            "removedAt": self.removedAt
        }

class Interaction: 
    '''
    Consider:
    - duration: indicates the time user spent on the article in milliseconds
        -> the longer the duration, the more likely the user is carefully reading the article
    - maxScrolledContent: indicates the maximum percentage of the article the user scrolled
        -> the higher the percentage, max 100%, the more likely the user is thoroughly reading the article
    
    -> combine the above two in which kind of method to get a better understanding of the user's reading behaviour????
    
    - views: indicates the number of separate clicks on a given article
    - delta (updated_at - created_at): indicates the time difference between the first and last interaction with the article
        -> if views > 1, then there are multiple accesses to the article, so the delta might be useful
    
    '''
    def __init__(self, data):
        self.id = str(data.get('_id', ''))
        self.articleId = data.get('articleId', '')
        self.articlePublishedDate = data.get('articlePublishedDate', '')
        self.createdAt = data.get('createdAt', '')
        self.duration = data.get('duration', 0)        
        self.maxScrolledContent = float(data.get('maxScrolledContent', 0.0) or 0.0)        
        self.updatedAt = data.get('updatedAt', '')
        self.views = data.get('views', 0)
        self.date = data.get('date', '')
        self.unique_days_before = data.get('unique_days_before', 0)
        self.first_survey = data.get('first_survey', '')
        self.experimental_week = data.get('experimental_week', '')

    def to_json(self):
        return {
            "id": self.id,
            "articleId": self.articleId,
            "articlePublishedDate": self.articlePublishedDate,
            "createdAt": self.createdAt,
            "duration": self.duration,
            "maxScrolledContent": self.maxScrolledContent,
            "updatedAt": self.updatedAt,
            "views": self.views,
            "date": self.date,
            "unique_days_before": self.unique_days_before,
            "first_survey": self.first_survey,
            "experimental_week": self.experimental_week
        }

class Favourite: 
    '''
    Consider the number of favourites a user has made to articles
    '''
    def __init__(self, data):
        self.id = str(data.get('_id', ''))
        self.articleId = data.get('articleId', '')
        self.createdAt = data.get('createdAt', '')
        self.articlePublishedDate = data.get('articlePublishedDate', '')
        self.removedAt = data.get('removedAt', None)

    def to_json(self):
        return {
            "id": self.id,
            "articleId": self.articleId,
            "createdAt": self.createdAt,
            "articlePublishedDate": self.articlePublishedDate,
            "removedAt": self.removedAt
        }

class Rating:
    def __init__(self, data):
        self.id = str(data.get('_id', ''))
        self.articleId = data.get('articleId', '')
        self.articleQuestionId = data.get('articleQuestionId', '')
        self.articleAnswer = data.get('articleAnswer', 0)
        self.createdAt = data.get('createdAt', '')
        # Include other fields as needed

    def to_json(self):
        return {
            "id": self.id,
            "articleId": self.articleId,
            "articleQuestionId": self.articleQuestionId,
            "articleAnswer": self.articleAnswer,
            "createdAt": self.createdAt,
        }

class View:
    def __init__(self, data):
        self.id = str(data.get('_id', ''))
        self.page = data.get('page', '')
        self.previousPage = data.get('previousPage', '')
        self.createdAt = data.get('createdAt', 0)
        self.articleId = data.get('articleId', '')
        self.isBookmarked = data.get('isBookmarked', False)
        self.isFavourited = data.get('isFavourited', False)
        self.primaryCategory = data.get('primaryCategory', '')
        self.fromArticleScreen = data.get('fromArticleScreen', False)
        # Include other fields as needed

    def to_json(self):
        return {
            "id": self.id,
            "page": self.page,
            "previousPage": self.previousPage,
            "createdAt": self.createdAt,
            "articleId": self.articleId,
            "isBookmarked": self.isBookmarked,
            "isFavourited": self.isFavourited,
            "primaryCategory": self.primaryCategory,
            "fromArticleScreen": self.fromArticleScreen,
        }

class User:
    def __init__(self, data):
        self.id = str(data.get('_id', ''))
        self.informfully_id = data.get('informfully_id', '')
        self.duration_in_seconds = data.get('Duration..in.seconds.', 0)
        self.informed_consent = data.get('informed_consent', 0)
        self.pol_int = data.get('pol_int', 0)
        self.pol_pos_1 = data.get('pol_pos_1', 0)
        self.pol_eff_1 = data.get('pol_eff_1', 0)
        self.pol_eff_2 = data.get('pol_eff_2', 0)
        self.pol_eff_3 = data.get('pol_eff_3', 0)
        self.pol_eff_4 = data.get('pol_eff_4', 0)
        self.pol_eff_5 = data.get('pol_eff_5', 0)
        self.iss_imp = data.get('iss_imp', 0)
        self.env_int = data.get('env_int', 0)
        self.nws_app = data.get('nws_app', 0)
        self.nws_int = data.get('nws_int', 0)
        self.env_new = data.get('env_new', 0)
        self.env_dis = data.get('env_dis', 0)
        # Initialize other scalar fields similarly...

        # Initialize lists of nested objects
        self.bookmarks = [Bookmark(b) for b in data.get('bookmarks', [])]
        self.favourites = [Favourite(f) for f in data.get('favourites', [])]
        self.interactions = [Interaction(i) for i in data.get('interactions', [])]
        self.ratings = [Rating(r) for r in data.get('ratings', [])]
        self.views = [View(v) for v in data.get('views', [])]
        # Initialize other nested lists if any...

    def to_json(self):
        return {
            "id": self.id,
            "informfully_id": self.informfully_id,
            "duration_in_seconds": self.duration_in_seconds,
            "informed_consent": self.informed_consent,
            "pol_int": self.pol_int,
            "pol_pos_1": self.pol_pos_1,
            "pol_eff_1": self.pol_eff_1,
            "pol_eff_2": self.pol_eff_2,
            "pol_eff_3": self.pol_eff_3,
            "pol_eff_4": self.pol_eff_4,
            "pol_eff_5": self.pol_eff_5,
            "iss_imp": self.iss_imp,
            "env_int": self.env_int,
            "nws_app": self.nws_app,
            "nws_int": self.nws_int,
            "env_new": self.env_new,
            "env_dis": self.env_dis,
            # Include other scalar fields...
            "bookmarks": [b.to_json() for b in self.bookmarks],
            "favourites": [f.to_json() for f in self.favourites],
            "interactions": [i.to_json() for i in self.interactions],
            "ratings": [r.to_json() for r in self.ratings],
            "views": [v.to_json() for v in self.views],
            # Include other nested lists...
        }

class User_Simple_Cluster:
    '''
    It contains the user's ID and dimensions for clustering, also the cluster label
    - informfully_id: user's ID
    - avg_duration: average duration of reading an article
    - avg_maxscroll: average max scrolled content of reading an article
    - avg_time_per_scroll: average time per scroll
    - avg_weekday_time_accessing_article: average time of accessing article on weekdays
    - var_weekday_time_accessing_article: variance of time of accessing article on weekdays
    - rush_hour: tag for rush hour accessing article
    - bedtime: tag for bedtime accessing article
    - work_hour: tag for work hour accessing article
    - weekend: tag for weekend accessing article
    - shallow: tag for shallow reading
    - medium: tag for medium reading
    - deep: tag for deep reading
    - cluster: cluster label
    '''  
    def __init__(self, data):
        self.informfully_id = data.get('informfully_id', '')
        self.avg_duration = data.get('avg_duration', 0)
        self.avg_maxscroll = data.get('avg_maxscroll', 0)
        self.avg_time_per_scroll = data.get('avg_time_per_scroll', 0)
        self.avg_weekday_time_accessing_article = data.get('avg_weekday_time_accessing_article', 0)
        self.var_weekday_time_accessing_article = data.get('var_weekday_time_accessing_article', 0)
        self.rush_hour = data.get('rush_hour', 0)
        self.bedtime = data.get('bedtime', 0)
        self.work_hour = data.get('work_hour', 0)
        self.weekend = data.get('weekend', 0)
        self.shallow = data.get('shallow', 0)
        self.medium = data.get('medium', 0)
        self.deep = data.get('deep', 0)
        self.cluster = data.get('cluster', 0)
    
    def to_json(self):
        return {
            "informfully_id": self.informfully_id,
            "avg_duration": self.avg_duration,
            "avg_maxscroll": self.avg_maxscroll,
            "avg_time_per_scroll": self.avg_time_per_scroll,
            "avg_weekday_time_accessing_article": self.avg_weekday_time_accessing_article,
            "var_weekday_time_accessing_article": self.var_weekday_time_accessing_article,
            "rush_hour": self.rush_hour,
            "bedtime": self.bedtime,
            "work_hour": self.work_hour,
            "weekend": self.weekend,
            "shallow": self.shallow,
            "medium": self.medium,
            "deep": self.deep,
            "cluster": self.cluster
        }
    

# Database connection
client = MongoClient('mongodb://localhost:27017/')
db = client['IDEA_dataset']
'''
'users_integrated' contains all the **raw** data of the users
'''
users_collection = db['users_integrated']
'''
'users_sim_cluster' contains the simplified data only containing cluster dimensions and labels
'''
users_collection_sc = db['users_sim_cluster']

users_collection_sc_raw = db['users_raw_data']

users_time_distribution = db['users_time_distribution']

for_clock = db['forClock']


def get_all_users():
    users_data = users_collection.find()
    users = [User(data) for data in users_data]
    return [user.to_json() for user in users]

def get_user_by_id(informfully_id):
    data = users_collection.find_one({'informfully_id': informfully_id})
    if data:
        user = User(data)
        return user.to_json()
    else:
        return None
    
def get_user_by_id_sc(informfully_id):
    data = users_collection.find_one({'informfully_id': informfully_id})
    if data:
        user = User_Simple_Cluster(data)
        return user.to_json()
    else:
        return None

def get_visualization_data():
    data = list(users_collection_sc.find({}, no_cursor_timeout=True))

    visualization_data = []
    for item in data:
        cluster = item.get('cluster', 0)
        
        avg_time = item.get('alpha', 0)
        
        # print(f"alpha: {avg_time}")

        theta = np.deg2rad(avg_time / 3600 / 24 * 360)
        
        radius = item.get('pca', 0)

        # print(f"pca: {radius}")
        
        visualization_data.append({
            "theta": theta,
            "radius": radius,
            "cluster": cluster
        })

    return visualization_data

def get_visualization_data_interactive(theta_chosen: str, radius_chosen: str):
    data = list(for_clock.find({}, no_cursor_timeout=True))

    visualization_data = []

    for item in data:
        cluster = item.get('cluster', 0)

        time = item.get(theta_chosen, 0)
        theta = np.deg2rad(time / 3600 / 24 * 360)

        radius = item.get(radius_chosen, 0)

        visualization_data.append({
            "theta": theta,
            "radius": radius,
            "cluster": cluster,
        })

    return visualization_data

def get_time_distribution():
    clusters = users_time_distribution.aggregate([
        {
            "$group": {
                "_id": "$cluster",
                "avg_duration": {"$avg": "$avg_duration"},
                "avg_maxscroll": {"$avg": "$avg_maxscroll"},
                "rush_hour_count": {"$sum": "$rush_hour"},
                "bedtime_count": {"$sum": "$bedtime"},
                "work_hour_count": {"$sum": "$work_hour"},
                "weekend_count": {"$sum": "$weekend"}
            }
        }
    ])

    distribution = []
    for cluster in clusters:
        distribution.append({
            "cluster": cluster["_id"],
            "avg_duration": cluster["avg_duration"],
            "avg_maxscroll": cluster["avg_maxscroll"],
            "rush_hour": cluster["rush_hour_count"],
            "bedtime": cluster["bedtime_count"],
            "work_hour": cluster["work_hour_count"],
            "weekend": cluster["weekend_count"]
        })

    return distribution

def get_category_distribution_by_cluster():
    # 定义目标分类列表
    target_categories = {
        "business", "crime", "entertainment&arts", "football", "health",
        "lifeandstyle", "politics", "science", "sport", "technology",
        "uk news", "world news", "environment", "others"
    }
    
    # 提取 clusters 信息
    clusters = {user['informfully_id']: user['cluster'] for user in users_collection_sc.find({}, {'informfully_id': 1, 'cluster': 1})}
    users = users_collection.find({}, {'informfully_id': 1, 'views': 1})

    category_distribution = {}

    for user in users:
        informfully_id = user.get('informfully_id')
        views = user.get('views', [])
        cluster = clusters.get(informfully_id, 'Unknown')

        # 初始化 cluster 分类统计
        if cluster not in category_distribution:
            category_distribution[cluster] = {}

        for view in views:
            category = view.get('primaryCategory', 'Unknown')
            if category is not None:
                category = category.lower()  # 转换为小写便于匹配
            else:
                category = 'unknown'  # 如果为 None，则设为 "unknown"

            # 将 'news' 和 'News' 归类为 'world news'
            if category in {'news', 'News'}:
                category = 'world news'
            elif category not in target_categories:  # 非目标分类时归为 others
                category = 'others'

            if category not in category_distribution[cluster]:
                category_distribution[cluster][category] = 0
            category_distribution[cluster][category] += 1

    response = []
    for cluster, categories in category_distribution.items():
        # 确保所有键为字符串
        cleaned_categories = {str(key): value for key, value in categories.items()}
        response.append({
            "cluster": cluster,
            "categories": cleaned_categories
        })
    
    return response

def get_scatter_plot_aggregated():
    data = list(db['processed_data_update'].find({}, {"_id": 0}))
    return data