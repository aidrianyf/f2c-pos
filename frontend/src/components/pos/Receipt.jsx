import { useRef } from 'react';
import { FiPrinter, FiX } from 'react-icons/fi';

const Receipt = ({ order, onClose }) => {
  const receiptRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header - Hide on print */}
        <div className="p-4 border-b flex items-center justify-between print:hidden">
          <h2 className="text-xl font-bold text-gray-800">Order Receipt</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <FiX size={24} />
          </button>
        </div>

        {/* Receipt Content - Optimized for printing */}
        <div ref={receiptRef} className="p-6 receipt-content">
          {/* Store Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Farm to Cup</h1>
            <p className="text-sm text-gray-600">Philippines Coffee Shop</p>
            <p className="text-xs text-gray-500 mt-1">Phone: (02) 1234-5678</p>
            <p className="text-xs text-gray-500">Email: info@farmtocup.ph</p>
          </div>

          <div className="border-t border-b border-dashed border-gray-300 py-3 mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Order #:</span>
              <span className="font-medium">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">
                {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Cashier:</span>
              <span className="font-medium">
                {order.cashier?.firstName} {order.cashier?.lastName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment:</span>
              <span className="font-medium capitalize">{order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : order.paymentMethod}</span>
            </div>
            {order.referenceNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ref #:</span>
                <span className="font-medium">{order.referenceNumber}</span>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="mb-4">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-300">
                <tr>
                  <th className="text-left py-2">Item</th>
                  <th className="text-center py-2">Qty</th>
                  <th className="text-right py-2">Price</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2">
                      <div className="font-medium">{item.productName}</div>
                      <div className="text-xs text-gray-600">
                        {item.size} - {item.temperature}
                      </div>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="text-xs text-gray-500">
                          + {item.modifiers.map(m => m.name).join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="text-center py-2">{item.quantity}</td>
                    <td className="text-right py-2">₱{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-300 pt-3 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">₱{order.subtotal.toFixed(2)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount:</span>
                <span>-₱{order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
              <span>Total:</span>
              <span>₱{order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cash Paid:</span>
              <span className="font-medium">₱{order.amountPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Change:</span>
              <span className="font-medium">₱{order.change.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t border-dashed border-gray-300 pt-4">
            <p className="mb-1">Thank you for your purchase!</p>
            <p className="mb-1">Please come again!</p>
            <p className="mt-3">Powered by Farm to Cup POS</p>
          </div>
        </div>

        {/* Action Buttons - Hide on print */}
        <div className="p-4 border-t flex space-x-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition"
          >
            <FiPrinter size={20} />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-content,
          .receipt-content * {
            visibility: visible;
          }
          .receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Receipt;
