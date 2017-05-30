from api.utility.table_names import ProdTables
from api.utility.table_names import TestTables
from passlib.hash import argon2
from api.models.shared_models import db
import time
import random
import string
from api.utility.labels import PaymentLabels as Labels
from api.utility.id_util import IdUtil
from api.models.market_product import MarketProduct
from api.utility.lob import Lob
from api.utility.stripe_api import StripeManager

class Order(db.Model):
	__tablename__ = ProdTables.OrderTable
	order_id = db.Column(db.String, primary_key = True)
	items_price = db.Column(db.Float)
	order_shipping = db.Column(db.Float)
	total_price = db.Column(db.Float)
	refund_date = db.Column(db.DateTime)
	stripe_customer_id = db.Column(db.String, nullable = False)
	stripe_charge_id = db.Column(db.String)
	lob_address_id = db.Column(db.String)
	address_line1 = db.Column(db.String)
	address_line2 = db.Column(db.String)
	address_zip = db.Column(db.String)
	address_country = db.Column(db.String)
	address_city = db.Column(db.String)
	address_name = db.Column(db.String)
	address_description = db.Column(db.String)
	address_state = db.Column(db.String)
	card_last4 = db.Column(db.String)
	card_brand = db.Column(db.String)

	date_created  = db.Column(db.DateTime,  default=db.func.current_timestamp())
	date_modified = db.Column(db.DateTime,  default=db.func.current_timestamp(),
										   onupdate=db.func.current_timestamp())

	account_id = db.Column(db.Integer, db.ForeignKey(ProdTables.UserInfoTable + '.' + Labels.AccountId))

	def __init__(self, user, cart, address):
		self.order_id = self.generateOrderId()
		self.items_price = cart.getCartItemsPrice()
		self.order_shipping = cart.getCartShippingPrice()
		self.account_id = user.account_id
		self.stripe_customer_id = user.stripe_customer_id
		self.lob_address_id = address.id
		self.address_name = address.name
		self.address_description = address.description
		self.address_city = address.address_city
		self.address_country = address.address_country
		self.address_line1 = address.address_line1
		self.address_line2 = address.address_line2
		self.address_zip = address.address_zip
		self.address_state = address.address_state
		self.total_price = self.items_price + self.order_shipping



		db.Model.__init__(self)


	@staticmethod
	def getOrderById(order_id):
		this_order = Order.query.filter_by(order_id = order_id).first()
		if this_order:
			return this_order
		else:
			return None


	@staticmethod
	def generateOrderId():
		new_order_id = IdUtil.id_generator()
		missing = Order.query.filter_by(order_id = new_order_id).first()
		while missing:
			new_order_id = IdUtil.id_generator()
			missing = OrderItem.query.filter_by(order_id = new_order_id).first()
		return new_order_id

	def updateCharge(self, charge):
		self.stripe_charge_id = charge[Labels.Id]
		self.card_last4 = charge[Labels.Source][Labels.Last4]
		self.card_brand = charge[Labels.Source][Labels.Brand]
		db.session.commit()


	def toPublicDict(self):
		public_dict = {}
		public_dict[Labels.OrderId] = self.order_id

		order_items = OrderItem.query.filter_by(order_id = self.order_id).all()
		public_dict[Labels.Items] = [item.toPublicDict() for item in order_items]
		public_dict[Labels.ItemsPrice] = self.items_price
		public_dict[Labels.OrderShipping] = self.order_shipping
		public_dict[Labels.TotalPrice] = self.total_price
		public_dict[Labels.DateCreated] = self.date_created
		address = {
			Labels.AddressName : self.address_name,
			Labels.AddressDescription : self.address_description,
			Labels.AddressCity : self.address_city,
			Labels.AddressCountry : self.address_country,
			Labels.AddressLine1 : self.address_line1,
			Labels.AddressLine2 : self.address_line2,
			Labels.AddressZip : self.address_zip,
			Labels.AddressState : self.address_state
		}
		public_dict[Labels.Address] = address
		public_dict[Labels.CardLast4] = self.card_last4
		public_dict[Labels.CardBrand] = self.card_brand
		# public_dict[Labels.Card] = StripeManager.getCardFromChargeId(self.stripe_charge_id)
		
		return public_dict
		
## user object class
class OrderItem(db.Model):
	__tablename__ = ProdTables.OrderItemTable
	primary_key = db.Column(db.Integer, primary_key = True, autoincrement = True)
	
	date_created  = db.Column(db.DateTime,  default=db.func.current_timestamp())
	date_modified = db.Column(db.DateTime,  default=db.func.current_timestamp(),
										   onupdate=db.func.current_timestamp())
	price = db.Column(db.Float)
	num_items = db.Column(db.Integer)
	variant_id = db.Column(db.Integer)
	name = db.Column(db.String)
	main_image = db.Column(db.String)
	product_id = db.Column(db.Integer, db.ForeignKey(ProdTables.MarketProductTable + '.' + Labels.ProductId))
	account_id = db.Column(db.Integer, db.ForeignKey(ProdTables.UserInfoTable + '.' + Labels.AccountId))
	# order_id = db.Column(db.String)
	order_id = db.Column(db.String, db.ForeignKey(ProdTables.OrderTable + "." + Labels.OrderId))

	# name,email, password all come from user inputs
	# email_confirmation_id, stripe_customer_id will be generated with try statements 
	def __init__(self, order_id, user, product,
			num_items = 1, variant_id = None, variant_type = None):
		self.order_id = order_id
		self.price = product.price
		self.num_items = num_items
		
		if variant_type:
			self.name = product.name + " - " + variant_type
		else:
			self.name = product.name
		self.product_id = product.product_id
		self.account_id = user.account_id
		self.variant_id = variant_id
		self.main_image = product.main_image
		this_order = Order.query.filter_by(order_id = order_id).first()
		if this_order:
			self.date_created = this_order.date_created
		db.Model.__init__(self)
	

	def toPublicDict(self):
		public_dict = {}
		public_dict[Labels.OrderId] = self.order_id
		public_dict[Labels.NumItems] = self.num_items
		public_dict[Labels.Price] = self.price
		public_dict[Labels.TotalPrice] = self.price * self.num_items
		public_dict[Labels.DateCreated] = self.date_created
		public_dict[Labels.ProductId] = self.product_id
		public_dict[Labels.VariantId] = self.variant_id
		public_dict[Labels.Name] = self.name
		public_dict[Labels.MainImage] = self.main_image	
		return public_dict


	