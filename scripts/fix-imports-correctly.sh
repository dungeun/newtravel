#!/bin/bash

# Fix only toast-related imports
find /Users/default/Desktop/travel -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/app/hooks/use-toast" | xargs sed -i '' 's|@/app/hooks/use-toast|@/components/ui/use-toast|g'
find /Users/default/Desktop/travel -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/hooks/use-toast" | xargs sed -i '' 's|@/hooks/use-toast|@/components/ui/use-toast|g'

# Fix only toast component imports
find /Users/default/Desktop/travel -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/app/components/ui/toast" | xargs sed -i '' 's|@/app/components/ui/toast|@/components/ui/toast|g'

# Revert incorrect hook path changes
find /Users/default/Desktop/travel -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/hooks/useAuth" | xargs sed -i '' 's|@/hooks/useAuth|@/app/hooks/useAuth|g'
find /Users/default/Desktop/travel -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/hooks/useCart" | xargs sed -i '' 's|@/hooks/useCart|@/app/hooks/useCart|g'
find /Users/default/Desktop/travel -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/hooks/useProductsQuery" | xargs sed -i '' 's|@/hooks/useProductsQuery|@/app/hooks/useProductsQuery|g'

echo "Fixed imports correctly"
