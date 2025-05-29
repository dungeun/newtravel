'use client';

import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Image from 'next/image';

interface PaymentMethodProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

export default function PaymentMethod({ selectedMethod, onMethodChange }: PaymentMethodProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
      <h2 className="text-xl font-semibold mb-4">결제 수단 선택</h2>
      
      <RadioGroup value={selectedMethod} onValueChange={onMethodChange} className="space-y-4">
        {/* 카드결제 */}
        <div className="flex items-center space-x-3 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <RadioGroupItem value="card" id="card" />
          <Label htmlFor="card" className="flex-1 cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="font-medium">신용/체크카드</span>
              <div className="flex space-x-2">
                <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs">VISA</div>
                <div className="w-10 h-6 bg-red-600 rounded flex items-center justify-center text-white text-xs">MASTER</div>
                <div className="w-10 h-6 bg-green-600 rounded flex items-center justify-center text-white text-xs">AMEX</div>
              </div>
            </div>
          </Label>
        </div>
        
        {/* 계좌이체 */}
        <div className="flex items-center space-x-3 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <RadioGroupItem value="bank" id="bank" />
          <Label htmlFor="bank" className="flex-1 cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="font-medium">실시간 계좌이체</span>
              <div className="text-sm text-gray-500">은행 선택 후 인터넷뱅킹 이체</div>
            </div>
          </Label>
        </div>
        
        {/* 카카오페이 */}
        <div className="flex items-center space-x-3 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <RadioGroupItem value="kakaopay" id="kakaopay" />
          <Label htmlFor="kakaopay" className="flex-1 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-400 rounded-md flex items-center justify-center mr-2">
                  <span className="text-sm font-bold">K</span>
                </div>
                <span className="font-medium">카카오페이</span>
              </div>
              <div className="text-sm text-gray-500">간편결제</div>
            </div>
          </Label>
        </div>
        
        {/* 네이버페이 */}
        <div className="flex items-center space-x-3 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <RadioGroupItem value="naverpay" id="naverpay" />
          <Label htmlFor="naverpay" className="flex-1 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center mr-2">
                  <span className="text-sm font-bold text-white">N</span>
                </div>
                <span className="font-medium">네이버페이</span>
              </div>
              <div className="text-sm text-gray-500">간편결제</div>
            </div>
          </Label>
        </div>
        
        {/* 토스페이 */}
        <div className="flex items-center space-x-3 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
          <RadioGroupItem value="tosspay" id="tosspay" />
          <Label htmlFor="tosspay" className="flex-1 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center mr-2">
                  <span className="text-sm font-bold text-white">T</span>
                </div>
                <span className="font-medium">토스페이</span>
              </div>
              <div className="text-sm text-gray-500">간편결제</div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
