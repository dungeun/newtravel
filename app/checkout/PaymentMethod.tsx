'use client';

import { useState } from 'react';

export default function PaymentMethod() {
  const [selectedMethod, setSelectedMethod] = useState<string>('');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">결제 수단</h3>
      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="radio"
            id="credit-card"
            name="payment-method"
            value="credit-card"
            checked={selectedMethod === 'credit-card'}
            onChange={() => setSelectedMethod('credit-card')}
            className="h-4 w-4 text-blue-600"
          />
          <label htmlFor="credit-card" className="ml-2 block text-sm text-gray-700">
            신용카드
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="radio"
            id="bank-transfer"
            name="payment-method"
            value="bank-transfer"
            checked={selectedMethod === 'bank-transfer'}
            onChange={() => setSelectedMethod('bank-transfer')}
            className="h-4 w-4 text-blue-600"
          />
          <label htmlFor="bank-transfer" className="ml-2 block text-sm text-gray-700">
            무통장 입금
          </label>
        </div>
      </div>
    </div>
  );
}
