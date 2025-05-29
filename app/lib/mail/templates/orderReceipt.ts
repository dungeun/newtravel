export function orderReceiptTemplate({ name, items, total, address }: { name: string; items: any[]; total: number; address: string }) {
  return `
    <h2>주문이 접수되었습니다</h2>
    <p>고객명: ${name}</p>
    <p>주소: ${address}</p>
    <ul>
      ${items.map(item => `<li>${item.product.title} x ${item.quantity.adult + item.quantity.child + item.quantity.infant}</li>`).join('')}
    </ul>
    <p>총 합계: ${total.toLocaleString()}원</p>
  `;
} 