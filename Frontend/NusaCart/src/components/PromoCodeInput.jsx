import { useState } from 'react';
import useDiscountStore from '../stores/discountStore';

const PromoCodeInput = ({ onDiscountApplied }) => {
  const [promoCode, setPromoCode] = useState('');
  const [showInput, setShowInput] = useState(false);

  const {
    appliedDiscount,
    discountValidation,
    validating,
    error,
    validatePromoCode,
    applyDiscount,
    removeDiscount,
    clearValidation,
    calculateDiscountAmount
  } = useDiscountStore();

  const handleValidateCode = async () => {
    if (!promoCode.trim()) return;

    try {
      const discount = await validatePromoCode(promoCode.trim());
      // Auto-apply if validation is successful and discount is valid
      if (discount && discount.valid) {
        applyDiscount(discount);
        setPromoCode('');
        setShowInput(false);
        if (onDiscountApplied) {
          onDiscountApplied(discount);
        }
      }
    } catch (error) {
      // Error is already handled by the store
    }
  };

  const handleRemoveDiscount = () => {
    removeDiscount();
    setPromoCode('');
    setShowInput(false);
    clearValidation();
    if (onDiscountApplied) {
      onDiscountApplied(null);
    }
  };

  const handleCancel = () => {
    setPromoCode('');
    setShowInput(false);
    clearValidation();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  if (appliedDiscount) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-green-800">
              Promo Code Applied: {appliedDiscount.promoCode}
            </h4>
            <p className="text-sm text-green-600">
              {appliedDiscount.description}
            </p>
            <p className="text-sm text-green-600">
              Discount: {appliedDiscount.discountPercentage}%
            </p>
          </div>
          <button
            onClick={handleRemoveDiscount}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  if (!showInput) {
    return (
      <button
        onClick={() => setShowInput(true)}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
      >
        <span>🏷️</span>
        <span>Add promo code</span>
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={validating}
          />
        </div>
        <button
          onClick={handleValidateCode}
          disabled={!promoCode.trim() || validating}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
        >
          {validating ? 'Validating...' : 'Apply'}
        </button>
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          Cancel
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      {discountValidation && !error && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Valid promo code!</span>
          </p>
          <p className="text-sm text-blue-600">
            {discountValidation.description}
          </p>
          <p className="text-sm text-blue-600">
            Get {discountValidation.discountPercentage}% off your order
          </p>
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput; 