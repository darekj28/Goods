from flask import Blueprint, jsonify, request
import time
import base64

from ..utility.stripe_api import StripeManager
from ..utility.order_manager import OrderManager
from ..utility.table_names import ProdTables

from api.models.shared_models import db
from api.models.order import Order
from api.models.user import User
from api.models.market_product import MarketProduct
from api.utility.json_util import JsonUtil




payment_api = Blueprint('payment_api', __name__)

@payment_api.route('/acceptStripePayment', methods = ['POST'])
def acceptStripePayment():
	# Token is created using Stripe.js or Checkout!
	# Get the payment token submitted by the form:
	token = request.json.get(Labels.StripeToken) # Using Flask
	product_id = request.json.get(Labels.ProductId)
	account_id = request.json.get(Labels.AccountId)

	this_product = MarketProduct.query.filter_by(product_id = product_id)
	this_user = User.query.filter_by(account_id = account_id)
	charge = StripeManager.chargeCustomer(token, this_product, this_user)

	new_order = Order(user, this_user, charge)
	return JsonUtil.success()

@payment_api.route('/getUserOrders', methods = ['POST'])
def getUserOrders():
	all_orders = Order.query.all()
	output_list = list()
	for order in all_orders:
		output_list.append(order.toPublicDict())
	return jsonify(output_list)