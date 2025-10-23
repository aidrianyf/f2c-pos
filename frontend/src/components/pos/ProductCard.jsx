const ProductCard = ({ product, onAddToCart }) => {
  // Get price from basePrice or first variant
  const price = product?.basePrice || product?.variants?.[0]?.price || 0;
  const isAvailable = product?.isAvailable !== false;
  const isLowStock = product?.trackInventory && product?.stockQuantity <= product?.lowStockThreshold;
  const isOutOfStock = product?.trackInventory && product?.stockQuantity === 0;

  return (
    <div
      onClick={() => isAvailable && !isOutOfStock && onAddToCart(product)}
      className={`group bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary overflow-hidden relative transform hover:-translate-y-1 ${
        isAvailable && !isOutOfStock ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed grayscale'
      }`}
    >
      {/* Coffee Cup Icon Background */}
      <div className="absolute top-0 right-0 text-gray-100 opacity-20 text-6xl transform rotate-12 translate-x-4 -translate-y-2">
        ☕
      </div>

      {/* Status Badges */}
      {isLowStock && !isOutOfStock && (
        <div className="absolute top-3 left-3 z-10">
          <span className="text-xs bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 rounded-full font-semibold shadow-md animate-pulse">
            Low Stock
          </span>
        </div>
      )}
      {isOutOfStock && (
        <div className="absolute top-3 left-3 z-10">
          <span className="text-xs bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full font-semibold shadow-md">
            Out of Stock
          </span>
        </div>
      )}

      <div className="p-5 relative z-10">
        {/* Product Image Placeholder */}
        <div className="w-full h-32 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg mb-3 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <span className="text-5xl">☕</span>
        </div>

        {/* Product Name */}
        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-base group-hover:text-primary transition-colors">
          {product?.name || 'Unknown'}
        </h3>

        {/* Category Badge */}
        <div className="mb-3">
          <span className="inline-block text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
            {product?.category?.name || 'Uncategorized'}
          </span>
        </div>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-2xl font-black bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
            ₱{price.toFixed(2)}
          </span>
          {product?.trackInventory && (
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                isOutOfStock ? 'bg-red-500' :
                isLowStock ? 'bg-yellow-500' :
                'bg-green-500'
              } animate-pulse`}></div>
              <span className="text-xs text-gray-600 font-medium">
                {product?.stockQuantity} left
              </span>
            </div>
          )}
          {!isAvailable && !isOutOfStock && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
              Unavailable
            </span>
          )}
        </div>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl"></div>
      </div>
    </div>
  );
};

export default ProductCard;
