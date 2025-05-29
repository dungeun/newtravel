declare module 'app/contexts/AuthContext' {
  import * as React from 'react';
  export const useAuth: () => any;
  export const AuthProvider: React.FC<{ children: React.ReactNode }>;
}

declare module '../../../contexts/AuthContext' {
  import * as React from 'react';
  export const useAuth: () => any;
  export const AuthProvider: React.FC<{ children: React.ReactNode }>;
  export default {};
} 