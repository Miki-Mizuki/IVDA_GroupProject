# from flask import Flask, request
# from flask_cors import CORS
# from flask_restx import Resource, Api
# from flask_pymongo import PyMongo
# from pymongo.collection import Collection
# from .model import User

# # Configure Flask & Flask-PyMongo:
# app = Flask(__name__)
# # allow access from any frontend
# cors = CORS()
# cors.init_app(app, resources={r"*": {"origins": "*"}})
# # add your mongodb URI
# app.config["MONGO_URI"] = "mongodb://localhost:27017/IDEA_dataset"
# pymongo = PyMongo(app)
# # Get a reference to the companies collection.
# users: Collection = pymongo.db.users_integrated
# api = Api(app)

# # class Users(Resource):
# #     def get(self):
# #         # retrieve the arguments and convert to a dict
# #         args = request.args.to_dict()
# #         # Build the query based on the provided arguments
# #         query = {}
# #         # consider user id first
# #         if 'informfully_id' in args:
# #             query['informfully_id'] = args['informfully_id']
# #         cursor = users.find(query)
# #         user = [User(**doc).to_json() for doc in cursor]
# #         return user
    
# class User_ret(Resource):
#     def get(self, informfully_id):
#         cursor = users.find_one({'informfully_id': informfully_id})
#         user = User(**cursor).to_json()
#         # do preprocessing, machine learning etc.
#         return user
        
# # we need add some more routes to the API

# api.add_resource(User_ret, '/users/<string:informfully_id>')



# __init__.py

from flask import Flask, jsonify
from flask_cors import CORS
from .model import get_all_users, get_user_by_id, get_user_by_id_sc, get_visualization_data

app = Flask(__name__)
CORS(app)

@app.route('/users', methods=['GET'])
def users():
    users = get_all_users()
    return jsonify(users)

@app.route('/users/<string:informfully_id>', methods=['GET'])
def user(informfully_id):
    user = get_user_by_id(informfully_id)
    if user:
        return jsonify(user)
    else:
        return jsonify({'error': 'User not found'}), 404
    
@app.route('/users_sim_cluster/<string:informfully_id>', methods=['GET'])
def users_sim_cluster(informfully_id):
    user = get_user_by_id_sc(informfully_id)
    if user:
        return jsonify(user)
    else:
        return jsonify({'error': 'User not found'}), 404
    
@app.route('/visualization', methods=['GET'])
def visualization():
    data = get_visualization_data()
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)