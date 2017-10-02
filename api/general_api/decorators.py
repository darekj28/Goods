import time 

from flask import Blueprint, jsonify, request
from api.utility.json_util import JsonUtil
from api.utility.jwt_util import JwtUtil
from api.utility.labels import MarketProductLabels as Labels
from api.models.shared_models import db
from api.models.user import User
from api.models.admin_user import AdminUser
from api.security.tracking import AdminAction
from functools import wraps
from api.utility.error import ErrorMessages

import base64
from api.s3.s3_api import S3

USERNAME = "username"

def check_admin_jwt(func):
	@wraps(func)
	def wrapper():
		jwt = request.json.get(Labels.Jwt)
		admin_user = JwtUtil.decodeAdminJwt(jwt)
		if not admin_user:
			AdminAction.addAdminAction(admin_user, request.path, request.remote_addr, success = False)
			return JsonUtil.failure(ErrorMessages.InvalidCredentials)
		return func(admin_user)
	return wrapper


def check_user_jwt(func):
	@wraps(func)
	def wrapper():

		jwt = request.json.get(Labels.Jwt)
		this_user = JwtUtil.getUserInfoFromJwt(jwt)
		if this_user == None:
			return JsonUtil.failure(ErrorMessages.InvalidCredentials)
		return func(this_user)
	return wrapper

def check_jwt(func):
	@wraps(func)
	def wrapper():
		jwt = request.json.get(Labels.Jwt)
		this_user = JwtUtil.getUserInfoFromJwt(jwt)
		time_1  = time.time()
		if this_user == None:
			admin_user = JwtUtil.decodeAdminJwt(jwt)
			if admin_user == None:
				return JsonUtil.failure(ErrorMessages.InvalidCredentials)
			elif admin_user.get(USERNAME):
				username = admin_user.get(USERNAME)
				admin_user_obj = AdminUser.query.filter_by(username = username).first()
				if admin_user_obj:
					return func(admin_user_obj)
				else:
					return JsonUtil.failure(ErrorMessages.InvalidCredentials)
			else:
				return JsonUtil.failure(ErrorMessages.InvalidCredentials)
		return func(this_user)
	return wrapper

