import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="bg-white rounded-lg p-3 border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 text-sm">{item.name}</h4>
          {item.selectedVariant && (
            <p className="text-xs text-gray-500">
              {item.selectedVariant.size} - {item.selectedVariant.temperature}
            </p>
          )}
          {item.modifiers && item.modifiers.length > 0 && (
            <p className="text-xs text-gray-500">
              + {item.modifiers.map(m => m.name).join(', ')}
            </p>
          )}
        </div>
        <button
          onClick={() => onRemove(item.cartId)}
          className="text-red-500 hover:text-red-700 p-1"
        >
          <FiTrash2 size={16} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onUpdateQuantity(item.cartId, item.quantity - 1)}
            className="p-1 hover:bg-gray-200 rounded"
            disabled={item.quantity <= 1}
          >
            <FiMinus size={14} />
          </button>
          <span className="px-2 text-sm font-medium">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <FiPlus size={14} />
          </button>
        </div>
        <span className="font-bold text-primary">₱{(item.price * item.quantity).toFixed(2)}</span>
      </div>
    </div>
  );
};

export default CartItem;
