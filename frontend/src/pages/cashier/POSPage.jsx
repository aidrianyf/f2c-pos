import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { orderService } from '../../services/orderService';
import { toast } from 'react-toastify';
import { FiSearch, FiShoppingCart, FiPackage } from 'react-icons/fi';
import ProductCard from '../../components/pos/ProductCard';
import CartItem from '../../components/pos/CartItem';
import Receipt from '../../components/pos/Receipt';

const POSPage = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedTemperature, setSelectedTemperature] = useState('all'); // 'all', 'hot', 'iced'
  const [isPayLater, setIsPayLater] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [selectedType, setSelectedType] = useState('drink'); // 'drink' or 'food'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getAllProducts(),
        categoryService.getAllCategories(),
      ]);

      if (productsData.success) setProducts(productsData.products);
      if (categoriesData.success) setCategories(categoriesData.categories);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (!product.isAvailable) {
      toast.error('This product is not available');
      return;
    }

    const cartId = Date.now() + Math.random();
    // Get price from basePrice or first variant
    const price = product.basePrice || product.variants?.[0]?.price || 0;

    const newItem = {
      cartId,
      productId: product._id,
      name: product.name,
      price: price,
      quantity: 1,
      selectedVariant: product.variants?.[0] || null,
      modifiers: [],
    };

    setCart([...cart, newItem]);
    toast.success(`${product.name} added to cart`);
  };

  const updateQuantity = (cartId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(cart.map(item =>
      item.cartId === cartId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const clearCart = () => {
    setCart([]);
    setPaymentMethod('cash');
    setPaymentAmount('');
    setReferenceNumber('');
    setShowCheckout(false);
    setIsPayLater(false);
    setCustomerName('');
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const total = calculateTotal();

    // Handle Pay Later validation
    if (isPayLater) {
      if (!customerName.trim()) {
        toast.error('Please enter customer name for unpaid orders');
        return;
      }
    } else {
      // Validate payment for immediate payment
      const payment = parseFloat(paymentAmount);

      if (!payment || payment < total) {
        toast.error('Payment amount is insufficient');
        return;
      }

      // Validate reference number for digital payments
      if ((paymentMethod === 'gcash' || paymentMethod === 'bank_transfer') && !referenceNumber.trim()) {
        toast.error('Please enter reference number for digital payment');
        return;
      }
    }

    try {
      const orderData = {
        items: cart.map(item => ({
          product: item.productId,
          quantity: item.quantity,
          size: item.selectedVariant?.size || '12oz',
          temperature: item.selectedVariant?.temperature || 'hot',
          modifiers: item.modifiers.map(m => m.name),
        })),
        paymentMethod: paymentMethod,
        amountPaid: isPayLater ? 0 : parseFloat(paymentAmount),
        referenceNumber: (paymentMethod === 'gcash' || paymentMethod === 'bank_transfer') ? referenceNumber : undefined,
        paymentStatus: isPayLater ? 'unpaid' : 'paid',
        customerName: isPayLater ? customerName : undefined,
      };

      console.log('Order Data being sent:', orderData);

      const response = await orderService.createOrder(orderData);

      if (response.success) {
        if (isPayLater) {
          toast.success(`Unpaid order ${response.order.orderNumber} created for ${customerName}!`);
        } else {
          toast.success(`Order ${response.order.orderNumber} created successfully!`);
        }
        setCompletedOrder(response.order);
        setShowReceipt(true);
        clearCart();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create order');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesType = product.category?.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || product.category?._id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Temperature filtering: check if product has any variant matching the temperature
    let matchesTemperature = true;
    if (selectedTemperature !== 'all') {
      if (product.variants && product.variants.length > 0) {
        matchesTemperature = product.variants.some(
          variant => variant.temperature?.toLowerCase() === selectedTemperature.toLowerCase()
        );
      }
    }

    return matchesType && matchesCategory && matchesSearch && matchesTemperature;
  });

  const total = calculateTotal();
  const change = paymentAmount ? Math.max(0, parseFloat(paymentAmount) - total) : 0;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if typing in input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // ESC - Clear cart or close checkout
      if (e.key === 'Escape') {
        if (showCheckout) {
          setShowCheckout(false);
        } else if (cart.length > 0) {
          if (window.confirm('Clear cart?')) {
            clearCart();
          }
        }
      }

      // Enter - Proceed to checkout or complete order
      if (e.key === 'Enter' && cart.length > 0) {
        if (!showCheckout) {
          setShowCheckout(true);
        } else if (paymentAmount && parseFloat(paymentAmount) >= total) {
          handleCheckout();
        }
      }

      // Number keys (1-9) - Quick add first 9 products
      if (!showCheckout && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (filteredProducts[index]) {
          addToCart(filteredProducts[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [cart, showCheckout, paymentAmount, total, filteredProducts]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-amber-50/20 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 shadow-xl sticky top-0 z-20 backdrop-blur-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/30 transform hover:scale-110 transition-transform">
              <span className="text-3xl">☕</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white drop-shadow-lg">Farm to Cup</h1>
              <p className="text-xs text-amber-100 font-medium">Point of Sale System</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/cashier/orders"
              className="flex items-center space-x-2 px-5 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-all duration-300 text-sm font-semibold border border-white/30 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FiPackage size={18} />
              <span>My Orders</span>
            </Link>
            <div className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <p className="text-sm font-bold text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-amber-100 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="px-5 py-2.5 bg-red-500/90 backdrop-blur-sm text-white rounded-xl hover:bg-red-600 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Products Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Search & Categories */}
          <div className="bg-white border-b p-4 space-y-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Type Tabs */}
            <div className="flex space-x-2 mb-3">
              <button
                onClick={() => {
                  setSelectedType('drink');
                  setSelectedCategory('all');
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  selectedType === 'drink'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ☕ Drinks
              </button>
              <button
                onClick={() => {
                  setSelectedType('food');
                  setSelectedCategory('all');
                }}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  selectedType === 'food'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🍴 Food
              </button>
            </div>

            <div className="flex space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.filter(cat => cat.type === selectedType).map(category => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category._id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                    selectedCategory === category._id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* Temperature Filter */}
            <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-600 mr-1">Temperature:</span>
              <button
                onClick={() => setSelectedTemperature('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all transform hover:scale-105 ${
                  selectedTemperature === 'all'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedTemperature('hot')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all transform hover:scale-105 flex items-center space-x-1 ${
                  selectedTemperature === 'hot'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>🔥</span>
                <span>Hot</span>
              </button>
              <button
                onClick={() => setSelectedTemperature('iced')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all transform hover:scale-105 flex items-center space-x-1 ${
                  selectedTemperature === 'iced'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>❄️</span>
                <span>Iced</span>
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} onAddToCart={addToCart} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart Section */}
        <div className="w-96 bg-white border-l flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FiShoppingCart className="mr-2" />
              Cart ({cart.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <FiShoppingCart className="mx-auto text-gray-300 mb-2" size={48} />
                <p className="text-gray-500">Cart is empty</p>
              </div>
            ) : (
              cart.map(item => (
                <CartItem
                  key={item.cartId}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))
            )}
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">₱{total.toFixed(2)}</span>
                </div>

                {showCheckout && (
                  <>
                    {/* Pay Later Toggle */}
                    <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <input
                        type="checkbox"
                        id="payLater"
                        checked={isPayLater}
                        onChange={(e) => setIsPayLater(e.target.checked)}
                        className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                      />
                      <label htmlFor="payLater" className="text-sm font-medium text-yellow-900">
                        Pay Later (Customer Tab)
                      </label>
                    </div>

                    {/* Customer Name for Pay Later */}
                    {isPayLater && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Customer Name *
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Enter customer name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    )}

                    {/* Payment Method Selection - Only show if not Pay Later */}
                    {!isPayLater && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Method
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => setPaymentMethod('cash')}
                            className={`px-3 py-2 font-medium text-sm rounded transition ${
                              paymentMethod === 'cash'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Cash
                          </button>
                          <button
                            onClick={() => setPaymentMethod('gcash')}
                            className={`px-3 py-2 font-medium text-sm rounded transition ${
                              paymentMethod === 'gcash'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            GCash
                          </button>
                          <button
                            onClick={() => setPaymentMethod('bank_transfer')}
                            className={`px-3 py-2 font-medium text-sm rounded transition ${
                              paymentMethod === 'bank_transfer'
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Bank
                          </button>
                        </div>
                      </div>

                        {/* GCash Info */}
                        {paymentMethod === 'gcash' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs font-medium text-blue-900 mb-1">GCash Payment Details:</p>
                            <p className="text-sm text-blue-800">0963 4302517</p>
                            <p className="text-xs text-blue-600">Eli Natividad</p>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Amount
                          </label>
                          <input
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>

                        {/* Reference Number for Digital Payments */}
                        {(paymentMethod === 'gcash' || paymentMethod === 'bank_transfer') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Reference Number *
                            </label>
                            <input
                              type="text"
                              value={referenceNumber}
                              onChange={(e) => setReferenceNumber(e.target.value)}
                              placeholder="Enter reference number"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>
                        )}

                        {/* Quick Cash Buttons - Only for Cash */}
                        {paymentMethod === 'cash' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Quick Cash
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {[50, 100, 200, 500, 1000].map((amount) => (
                                <button
                                  key={amount}
                                  onClick={() => setPaymentAmount(amount.toString())}
                                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm rounded transition"
                                >
                                  ₱{amount}
                                </button>
                              ))}
                              <button
                                onClick={() => setPaymentAmount(Math.ceil(total).toString())}
                                className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium text-sm rounded transition"
                              >
                                Exact
                              </button>
                            </div>
                          </div>
                        )}

                        {paymentAmount && paymentMethod === 'cash' && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Change:</span>
                            <span className="font-semibold text-green-600">₱{change.toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2">
                {!showCheckout ? (
                  <>
                    <button
                      onClick={() => setShowCheckout(true)}
                      className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition"
                    >
                      Proceed to Checkout
                    </button>
                    <button
                      onClick={clearCart}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
                    >
                      Clear Cart
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
                    >
                      Complete Order
                    </button>
                    <button
                      onClick={() => setShowCheckout(false)}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
                    >
                      Back
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && completedOrder && (
        <Receipt
          order={completedOrder}
          onClose={() => {
            setShowReceipt(false);
            setCompletedOrder(null);
          }}
        />
      )}

      {/* Keyboard Shortcuts Helper */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 text-xs">
        <p className="font-semibold text-gray-700 mb-2">Keyboard Shortcuts:</p>
        <div className="space-y-1 text-gray-600">
          <div><kbd className="px-2 py-1 bg-gray-100 rounded">1-9</kbd> Quick add product</div>
          <div><kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> Checkout / Complete</div>
          <div><kbd className="px-2 py-1 bg-gray-100 rounded">ESC</kbd> Cancel / Clear cart</div>
        </div>
      </div>
    </div>
  );
};

export default POSPage;
