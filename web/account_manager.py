import time
import datetime
import string
import random
import os
import sys
import time
import psycopg2
import urllib
import base64
import email_api
from credentials import credential
from sql_manager import SqlManager
					

user_info_columns = [
						{"name" : "time_stamp", "type" : "FLOAT"},
						{"name" : "email",		"type" : "TEXT"},
						{"name" : "email_confirmation_id", "type" : "TEXT"},
						{"name" : "email_confirmed", "type": "BOOL"}
					]



class AccountManager:
	def __init__(self):
		self.sql = SqlManager()
		self.USER_INFO_TABLE= "USER_INFO_TABLE"
		
	# closes the conncetion to the postgre sql database
	def closeConnection(self):
		self.sql.closeConnection()

	# initializes a user info table 
	def createUserInfoTable(self):
		table_name = self.USER_INFO_TABLE
		self.sql.createNewTable(table_name)
		for col in user_info_columns:
			self.sql.addColumnToTable(table_name, column_name = col['name'], data_type = col['type'])


	# handles a new user email
	# first checks if the email is in the table
	# also checks if it's a real email too with a try/except in email_api.py
	def addEmailToUserInfoTable(self, input_email):
		self.sql.createNewTable(self.USER_INFO_TABLE)
		output = {}
		try:
			email = input_email.lower()
		except:
			output['result'] = 'failure'
			output['error'] = "Email is not a string"
			return output

		email_confirmation_id = self.generateEmailConfirmationId()
		print(self.tableHasEmail(email))
		if self.tableHasEmail(email):
			output['result'] = 'failure'
			output['error'] = "No need to send an confirmation since this email exists!"
			return output
		try:
			email_api.sendEmailConfirmation(email, email_confirmation_id)
		except:
			output['result'] = 'failure'
			output['error'] = "Invalid Email Address"
			return output
		table_name = self.USER_INFO_TABLE
		time_stamp = time.time()
		self.sql.addColumnToTable(table_name, 'email')
		sql = "INSERT INTO " + table_name + " (email) VALUES (%s)"
		mogrified_sql = self.sql.db.mogrify(sql, (email,))
		self.sql.db.execute(mogrified_sql)
		default_info = {}
		default_info['time_stamp'] = time_stamp
		default_info['email_confirmed'] = False
		default_info['email_confirmation_id'] = email_confirmation_id
		default_info['email'] = email
		for col in user_info_columns:
			key = col['name']
			self.sql.addColumnToTable(table_name, col['name'], col['type'])
			self.sql.updateEntryByKey(table_name, 'email', email, key, default_info[key])
		output['result'] = 'success'
		return output

	# generates a new email_confirmation_id
	def generateEmailConfirmationId(self):
		new_email_id = self.sql.id_generator()
		while self.tableHasConfirmationId(new_email_id):
			new_email_id = self.sql.id_generator()
		return new_email_id

	def tableHasConfirmationId(self, email_confirmation_id):
		table_name = self.USER_INFO_TABLE
		column_name = "email_confirmation_id"
		entry_data = email_confirmation_id
		return self.sql.tableHasEntryWithProperty(table_name, column_name, entry_data)


	# returns true if the email is in the table
	def tableHasEmail(self, email):
		table_name = self.USER_INFO_TABLE
		column_name = "email"
		entry_data = email
		return self.sql.tableHasEntryWithProperty(table_name, column_name, entry_data)

	# returns true if the email is confirmed
	# returns false if the email is not confirmed or does not exists
	# I understand the 'email' magic string, still thinking the best way to handle it right now
	# how to make a Labels like class for all the db management
	def isEmailConfirmed(self, email):
		table_name = self.USER_INFO_TABLE
		table_data = self.sql.getTableDataAsDict(table_name)
		is_confirmed = False
		for row in table_data:
			if row['email'] == email.lower():
				if row['email_confirmed'] == True:
					is_confirmed = True
					break
		return is_confirmed


	# sets the 'email_confirmed' column to true for this e-mail
	def confirmEmail(self, email_confirmation_id):
		table_name = self.USER_INFO_TABLE
		key_column_name = "email_confirmation_id"
		key = email_confirmation_id
		target_column_name = "email_confirmed"
		data = True
		self.sql.updateEntryByKey(table_name, key_column_name, key, target_column_name, data)
		output = {}
		output['result'] = 'success'
		return output
		#### should we do this?
		# then we delete the old confirmation pin once confirmed
		# target_column_name = "email_confirmation_id"
		# data = ""
		# self.sql.updateEntryByKey(table_name, key_column_name, key, target_column_name, data)

