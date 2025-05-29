import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TravelProduct } from '../../types/product';

// Cart item type
export interface CartItem {
  productId: string;
  product: TravelProduct;
  quantity: {
    adult: number;
    child: number;
    infant: number;
  };
  travelDate: {
    startDate: string;
    endDate: string;
  };
  subtotal: number;
}

// Cart state type
interface CartState {
  items: CartItem[];
  totalAmount: number;
  currency: string;
  
  // Actions
  addItem: (
    product: TravelProduct, 
    quantity: { adult: number; child: number; infant: number; },
    travelDate: { startDate: string; endDate: string; }
  ) => void;
  updateItemQuantity: (
    index: number,
    newQuantity: { adult: number; child: number; infant: number; }
  ) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
}

// Helper to calculate subtotal
const calculateSubtotal = (
  product: TravelProduct,
  quantity: { adult: number; child: number; infant: number; }
): number => {
  return (
    (quantity.adult * product.price.adult) + 
    (quantity.child * (product.price.child || 0)) + 
    (quantity.infant * (product.price.infant || 0))
  );
};

// Helper to calculate total
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.subtotal, 0);
};

// Create the cart store
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      totalAmount: 0,
      currency: 'KRW',
      
      // Actions
      addItem: (product, quantity, travelDate) => {
        const { items } = get();
        
        // Check if item already exists
        const existingItemIndex = items.findIndex(item => 
          item.productId === product.id && 
          item.travelDate.startDate === travelDate.startDate &&
          item.travelDate.endDate === travelDate.endDate
        );
        
        const subtotal = calculateSubtotal(product, quantity);
        
        if (existingItemIndex >= 0) {
          // Update existing item
          const updatedItems = [...items];
          const item = updatedItems[existingItemIndex];
          
          // Update quantity
          item.quantity.adult += quantity.adult;
          item.quantity.child += quantity.child;
          item.quantity.infant += quantity.infant;
          
          // Recalculate subtotal
          item.subtotal = calculateSubtotal(product, item.quantity);
          
          set({ 
            items: updatedItems,
            totalAmount: calculateTotal(updatedItems)
          });
        } else {
          // Add new item
          const newItems = [
            ...items,
            {
              productId: product.id,
              product,
              quantity,
              travelDate,
              subtotal
            }
          ];
          
          set({ 
            items: newItems,
            totalAmount: calculateTotal(newItems)
          });
        }
      },
      
      updateItemQuantity: (index, newQuantity) => {
        const { items } = get();
        
        if (index >= 0 && index < items.length) {
          const updatedItems = [...items];
          const item = updatedItems[index];
          
          // Update quantity
          item.quantity = newQuantity;
          
          // Recalculate subtotal
          item.subtotal = calculateSubtotal(item.product, newQuantity);
          
          set({ 
            items: updatedItems,
            totalAmount: calculateTotal(updatedItems)
          });
        }
      },
      
      removeItem: (index) => {
        const { items } = get();
        
        if (index >= 0 && index < items.length) {
          const updatedItems = [...items];
          updatedItems.splice(index, 1);
          
          set({ 
            items: updatedItems,
            totalAmount: calculateTotal(updatedItems)
          });
        }
      },
      
      clearCart: () => {
        set({ 
          items: [],
          totalAmount: 0
        });
      }
    }),
    {
      name: 'travel-cart-storage', // unique name for localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
); 