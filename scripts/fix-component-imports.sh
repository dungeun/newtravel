#!/bin/bash

# Fix UI component imports from @/app/components/ui to @/components/ui
find /Users/default/Desktop/travel -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/app/components/ui/" | xargs sed -i '' 's|@/app/components/ui/|@/components/ui/|g'

# Fix imports from @/app/hooks to @/hooks if needed
find /Users/default/Desktop/travel -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "@/app/hooks/" | xargs sed -i '' 's|@/app/hooks/|@/hooks/|g'

echo "Fixed component imports across the project"
