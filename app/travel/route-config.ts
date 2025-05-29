// Default revalidation settings for all routes
export const routeConfig = {
  // Default revalidation time in seconds
  revalidate: 60, // 1 minute
  
  // Common paths
  routes: {
    home: '/travel',
    products: '/travel/products',
    product: '/travel/product',
    cart: '/travel/cart',
    checkout: '/travel/checkout',
    orders: '/travel/orders',
    mypage: '/travel/mypage',
    login: '/travel/login',
    register: '/travel/register',
    search: '/travel/search',
  },
  
  // API endpoints
  api: {
    products: '/api/products',
    product: '/api/product',
    cart: '/api/cart',
    checkout: '/api/checkout',
    orders: '/api/orders',
    auth: '/api/auth',
  }
};

// Helper function to get revalidation time
export function getRevalidateTime(route: string): number {
  // Add custom revalidation times for specific routes if needed
  const routeConfig = {
    '/travel/product': 300, // 5 minutes for product pages
    '/travel/products': 180, // 3 minutes for product listings
    default: 60 // 1 minute default
  };
  
  return routeConfig[route as keyof typeof routeConfig] || routeConfig.default;
}
