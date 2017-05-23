from flask import Blueprint, jsonify, request
import time
import base64

from ..utility.stripe_api import StripeManager

from api.models.shared_models import db
from api.models.user import User
from api.models.cart import CartItem
from api.models.cart import Cart
from api.models.market_product import MarketProduct
from api.models.market_product import ProductVariant
from api.utility.json_util import JsonUtil
from api.utility.labels import CartLabels as Labels
from api.utility.jwt_util import JwtUtil
from api.utility import email_api 
from api.models.order import Order
from api.utility.lob import Lob

cart_api = Blueprint('cart_api', __name__)

# default adds item to cart with num_items = 1
# if the item already exists in the cart, increment the number by 1
# might need to modularize this a little bit
@cart_api.route('/addItemToCart', methods = ['POST'])
def addItemToCart():
	account_id = request.json.get(Labels.AccountId)
	product_id = request.json.get(Labels.ProductId)
	quantity = int(request.json.get(Labels.Quantity))
	jwt = request.json.get(Labels.Jwt)
	if not JwtUtil.validateJwtUser(jwt, account_id):
		return JsonUtil.jwt_failure()
	this_user = JwtUtil.getUserInfoFromJwt(jwt)
	variant = request.json.get(Labels.Variant)
	if variant:
		variant_id = variant.get(Labels.VariantId)
	else:
		variant_id = None

	if variant_id:
		this_variant = ProductVariant.query.filter_by(variant_id = variant_id).first()

		if this_variant:
			variant_type = this_variant.variant_type
			cart_item = CartItem.query.filter_by(account_id = account_id, product_id = product_id,
				variant_id = variant_id).first()

			if cart_item == None:
				new_cart_item = CartItem(account_id, product_id, num_items = quantity,
					variant_id = variant_id, variant_type = variant_type)
				db.session.add(new_cart_item)
				db.session.commit()
				return JsonUtil.successWithOutput({
						Labels.User : this_user.toPublicDict(),
						Labels.Jwt : JwtUtil.create_jwt(this_user.toJwtDict())
					})
			else:
				try:
					cart_item.updateCartQuantity(cart_item.num_items + quantity)
				except Exception as e:
					return JsonUtil.failure("Something went wrong while adding item to cart " + str(e))


		else:
			raise Exception("Error, there's a variant_id that's available, but no variant to go with it. \n \
				This rogue variant_id is " + str(variant_id) + ")")

	else:
		cart_item = CartItem.query.filter_by(account_id = account_id, product_id = product_id).first()

		if cart_item == None:
			new_cart_item = CartItem(account_id, product_id, num_items = quantity)
			db.session.add(new_cart_item)
			db.session.commit()
			return JsonUtil.successWithOutput({
				Labels.User : this_user.toPublicDict(),
				Labels.Jwt : JwtUtil.create_jwt(this_user.toJwtDict())
			})
		else:
			try:
				cart_item.updateCartQuantity(cart_item.num_items + quantity)
			except Exception as e:
				return JsonUtil.failure("Something went wrong while adding item to cart " + str(e))

		return JsonUtil.successWithOutput({
				Labels.User : this_user.toPublicDict(),
				Labels.Jwt : JwtUtil.create_jwt(this_user.toJwtDict())
			})

# checkout cart
@cart_api.route('/checkoutCart', methods = ['POST'])
def checkoutCart():
	account_id = request.json.get(Labels.AccountId)
	jwt = request.json.get(Labels.Jwt)
	if not JwtUtil.validateJwtUser(jwt, account_id):
		return JsonUtil.jwt_failure()
	card_id = request.json.get(Labels.CardId)
	address_id = request.json.get(Labels.AddressId)
	address = Lob.getAddressById(address_id)

	if int(address.metadata[Labels.AccountId]) != account_id:
		return JsonUtil.failure("Address does not go with this user")

	this_cart = Cart(account_id)
	total_price = this_cart.total_price
	this_user = User.query.filter_by(account_id = account_id).first()
	order_id = Order.generateOrderId()

	# charge this price to the customer via stripe
	# stripe automatically checks if the card matches the customer 
	try:
		charge = StripeManager.chargeCustomerCard(this_user, card_id ,total_price)
	except Exception as e:
		return JsonUtil.failure("Something went wrong while trying to process payment information " + str(e))

	# record this transaction for each product (enabling easier refunds), but group by quantity 
	for cart_item in this_cart.items:
		# update the inventory
		this_product = MarketProduct.query.filter_by(product_id = cart_item.product_id).first()
		if cart_item.variant_type:
			this_variant = ProductVariant.query.filter_by(variant_id = cart_item.variant_id).first()
			this_variant.inventory = this_variant.inventory - cart_item.num_items
		else:
			this_product.inventory = this_product.inventory - cart_item.num_items
		new_order = Order(order_id, this_user, this_product, address, charge, cart_item.num_items, cart_item.variant_id, cart_item.variant_type)
		db.session.add(new_order)
		db.session.commit()

	db.session.commit()
	email_api.sendPurchaseNotification(this_user, this_cart, address, order_id)
	this_cart.clearCart()
	return JsonUtil.successWithOutput({
			Labels.User : this_user.toPublicDict(),
			Labels.Jwt : JwtUtil.create_jwt(this_user.toJwtDict())
		})


@cart_api.route('/getUserCart', methods = ['POST'])
def getUserCart():
	account_id = request.json.get(Labels.AccountId)
	jwt = request.json.get(Labels.Jwt)
	if not JwtUtil.validateJwtUser(jwt, account_id):
		return JsonUtil.jwt_failure()
	
	this_cart = Cart(account_id)
	total_price = this_cart.total_price
	return JsonUtil.success(Labels.Cart, this_cart.toPublicDict())


@cart_api.route('/getCheckoutInformation', methods = ['POST'])
def getCheckoutInformation():
	account_id = request.json.get(Labels.AccountId)
	jwt = request.json.get(Labels.Jwt)
	if not JwtUtil.validateJwtUser(jwt, account_id):
		return JsonUtil.jwt_failure()
	this_user = User.query.filter_by(account_id = account_id).first()
	if this_user == None:
		return JsonUtil.failure("User does not exist")
	this_cart = Cart(account_id)
	addresses = this_user.getAddresses()
	cards = this_user.getCreditCards()
	return JsonUtil.successWithOutput({Labels.Addresses : addresses, Labels.Cards : cards, 
		Labels.Cart : this_cart.toPublicDict()})


@cart_api.route('/updateCartQuantity', methods = ['POST'])
def updateCartQuantity():
	account_id = request.json.get(Labels.AccountId)
	jwt = request.json.get(Labels.Jwt)
	if not JwtUtil.validateJwtUser(jwt, account_id):
		return JsonUtil.jwt_failure()

	this_user = JwtUtil.getUserInfoFromJwt(jwt)

	this_cart_item = request.json.get(Labels.CartItem)
	product_id = this_cart_item.get(Labels.ProductId)

	new_num_items = int(request.json.get(Labels.NewNumItems))
	this_product = MarketProduct.query.filter_by(product_id = product_id).first()
	if not this_product:
		return JsonUtil.jwt_failure("Product doesn't exist")

	if this_product.has_variants:
		variant_id = this_cart_item.get(Labels.VariantId)
		cart_item = CartItem.query.filter_by(account_id = account_id, product_id = product_id, variant_id = variant_id).first()
		try:
			cart_item.updateCartQuantity(new_num_items)
		except Exception as e:
			return JsonUtil.failure("Something went wrong while updating variant cart quantity : " + str(e))


	else:
		cart_item = CartItem.query.filter_by(account_id = account_id, product_id = product_id).first()
		try:
			cart_item.updateCartQuantity(new_num_items)
		except Exception as e:
			return JsonUtil.failure("Something went wrong while updating cart quantity : " + str(e))

	return JsonUtil.successWithOutput({
				Labels.User : this_user.toPublicDict(),
				Labels.Jwt : JwtUtil.create_jwt(this_user.toJwtDict())
			})	





