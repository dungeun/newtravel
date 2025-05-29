// Revalidation configuration for the application
export const revalidation = {
  // Default revalidation time in seconds
  default: 60, // 1 minute
  
  // Disable revalidation (for dynamic routes)
  disabled: 0,
  
  // Specific routes
  routes: {
    product: 300, // 5 minutes
    products: 180, // 3 minutes
    payment: 0, // No caching for payment pages
    checkout: 0, // No caching for checkout
    mypage: 0, // No caching for mypage
    profile: 0, // No caching for profile
    auth: 0, // No caching for auth pages
    admin: 0, // No caching for admin pages
  },
  
  // Get revalidation time for a specific route
  getRevalidationTime(pathname: string): number {
    // Check for specific routes first
    for (const [route, time] of Object.entries(this.routes)) {
      if (pathname.includes(route)) {
        return time as number;
      }
    }
    
    // Default revalidation time
    return this.default;
  },
};

export default revalidation;
