import { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import { toast } from 'react-toastify';
import { FiDollarSign, FiUser, FiCalendar, FiX, FiCheck } from 'react-icons/fi';

const UnpaidOrdersPage = () => {
  const [unpaidOrders, setUnpaidOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');

  useEffect(() => {
    loadUnpaidOrders();
  }, []);

  const loadUnpaidOrders = async () => {
    try {
      const response = await orderService.getUnpaidOrders();
      if (response.success) {
        setUnpaidOrders(response.orders);
      }
    } catch (error) {
      toast.error('Failed to load unpaid orders');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = (order) => {
    setSelectedOrder(order);
    setAmountPaid(order.total.toString());
    setShowPaymentModal(true);
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setSelectedOrder(null);
    setPaymentMethod('cash');
    setAmountPaid('');
    setReferenceNumber('');
  };

  const handleConfirmPayment = async () => {
    if (!selectedOrder) return;

    const payment = parseFloat(amountPaid);

    if (!payment || payment < selectedOrder.total) {
      toast.error('Payment amount is insufficient');
      return;
    }

    // Validate reference number for digital payments
    if ((paymentMethod === 'gcash' || paymentMethod === 'bank_transfer') && !referenceNumber.trim()) {
      toast.error('Please enter reference number for digital payment');
      return;
    }

    try {
      const response = await orderService.markOrderAsPaid(selectedOrder._id, {
        amountPaid: payment,
        paymentMethod,
        referenceNumber: (paymentMethod === 'gcash' || paymentMethod === 'bank_transfer') ? referenceNumber : undefined,
      });

      if (response.success) {
        toast.success(`Order ${selectedOrder.orderNumber} marked as paid!`);
        handleCloseModal();
        loadUnpaidOrders(); // Reload the list
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark order as paid');
    }
  };

  const change = amountPaid ? Math.max(0, parseFloat(amountPaid) - (selectedOrder?.total || 0)) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Unpaid Orders</h1>
        <p className="text-gray-600 mt-1">Manage customer tabs and pending payments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Unpaid Orders</p>
              <p className="text-2xl font-bold text-gray-800">{unpaidOrders.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FiUser className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Amount Due</p>
              <p className="text-2xl font-bold text-gray-800">
                ₱{unpaidOrders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FiDollarSign className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Order</p>
              <p className="text-2xl font-bold text-gray-800">
                ₱{unpaidOrders.length > 0
                  ? (unpaidOrders.reduce((sum, order) => sum + order.total, 0) / unpaidOrders.length).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiCalendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cashier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {unpaidOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No unpaid orders found
                  </td>
                </tr>
              ) : (
                unpaidOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{order.orderNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-semibold">{order.customerName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.items.length} items</td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-600">₱{order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.cashier?.firstName} {order.cashier?.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleMarkAsPaid(order)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition flex items-center gap-1"
                      >
                        <FiCheck size={16} />
                        Mark Paid
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Mark Order as Paid</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-full">
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Order Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Order Number:</p>
                <p className="font-semibold text-gray-800">{selectedOrder.orderNumber}</p>
                <p className="text-sm text-gray-600 mt-2">Customer:</p>
                <p className="font-semibold text-gray-800">{selectedOrder.customerName}</p>
                <p className="text-sm text-gray-600 mt-2">Amount Due:</p>
                <p className="text-2xl font-bold text-primary">₱{selectedOrder.total.toFixed(2)}</p>
              </div>

              {/* Payment Method */}
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

              {/* Payment Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount
                </label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Reference Number */}
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

              {/* Change */}
              {amountPaid && paymentMethod === 'cash' && (
                <div className="flex justify-between text-sm bg-green-50 p-3 rounded-lg">
                  <span className="text-gray-600">Change:</span>
                  <span className="font-semibold text-green-600">₱{change.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex space-x-3">
              <button
                onClick={handleConfirmPayment}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Confirm Payment
              </button>
              <button
                onClick={handleCloseModal}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnpaidOrdersPage;
