#!/bin/bash

# Fix imports from @/app/hooks/use-toast to @/components/ui/use-toast
find /Users/default/Desktop/travel -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/app/hooks/use-toast" | xargs sed -i '' 's|@/app/hooks/use-toast|@/components/ui/use-toast|g'

# Fix imports from @/app/components/ui/toast to @/components/ui/toast
find /Users/default/Desktop/travel -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/app/components/ui/toast" | xargs sed -i '' 's|@/app/components/ui/toast|@/components/ui/toast|g'

# Fix imports from @/hooks/use-toast to @/components/ui/use-toast
find /Users/default/Desktop/travel -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/hooks/use-toast" | xargs sed -i '' 's|@/hooks/use-toast|@/components/ui/use-toast|g'
