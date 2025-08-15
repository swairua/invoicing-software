// Comprehensive fix for all unsafe date operations
const fs = require('fs');
const path = require('path');

const fixes = [
  {
    file: 'client/pages/Dashboard.tsx',
    replacements: [
      {
        search: 'new Date(day.date).toLocaleDateString()',
        replace: 'safeToLocaleDateString(day.date)'
      },
      {
        search: 'payment.date.toLocaleDateString()',
        replace: 'safeToLocaleDateString(payment.date)'
      },
      {
        search: 'new Date(day.date).toLocaleDateString("en", {\n                          weekday: "short",',
        replace: 'safeToLocaleDateString(day.date, "en", {\n                          weekday: "short",'
      }
    ],
    addImport: 'import { safeToLocaleDateString } from "@/lib/utils";'
  },
  {
    file: 'client/pages/UserManagement.tsx',
    replacements: [
      {
        search: 'user.createdAt.toLocaleDateString()',
        replace: 'safeToLocaleDateString(user.createdAt)'
      }
    ],
    addImport: 'import { safeToLocaleDateString } from "@/lib/utils";'
  },
  {
    file: 'client/pages/ProductDetails.tsx',
    replacements: [
      {
        search: 'movement.createdAt.toLocaleDateString()',
        replace: 'safeToLocaleDateString(movement.createdAt)'
      },
      {
        search: 'movement.createdAt.toLocaleTimeString()',
        replace: 'safeToLocaleTimeString(movement.createdAt)'
      }
    ],
    addImport: 'import { safeToLocaleDateString, safeToLocaleTimeString } from "@/lib/utils";'
  },
  {
    file: 'client/pages/TaxSettings.tsx',
    replacements: [
      {
        search: 'new Date(tax.applicableFrom).toLocaleDateString()',
        replace: 'safeToLocaleDateString(tax.applicableFrom)'
      },
      {
        search: 'new Date(tax.applicableUntil).toLocaleDateString()',
        replace: 'safeToLocaleDateString(tax.applicableUntil)'
      }
    ],
    addImport: 'import { safeToLocaleDateString } from "@/lib/utils";'
  },
  {
    file: 'client/pages/Reports.tsx',
    replacements: [
      {
        search: 'new Date().toLocaleDateString()',
        replace: 'safeToLocaleDateString(new Date())'
      }
    ],
    addImport: 'import { safeToLocaleDateString } from "@/lib/utils";'
  },
  {
    file: 'client/components/TemplateSelector.tsx',
    replacements: [
      {
        search: 'new Date().toLocaleDateString()',
        replace: 'safeToLocaleDateString(new Date())'
      },
      {
        search: 'new Date(\n                      Date.now() + 30 * 24 * 60 * 60 * 1000,\n                    ).toLocaleDateString()',
        replace: 'safeToLocaleDateString(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))'
      }
    ],
    addImport: 'import { safeToLocaleDateString } from "@/lib/utils";'
  }
];

console.log('Starting comprehensive date fixes...');

fixes.forEach(({ file, replacements, addImport }) => {
  console.log(`Fixing ${file}...`);
  
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add import if not already present
    if (addImport && !content.includes('safeToLocaleDateString')) {
      // Find a good place to add the import (after other imports)
      const lines = content.split('\n');
      let importInserted = false;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('import') && lines[i].includes('@/') && !importInserted) {
          lines.splice(i + 1, 0, addImport);
          importInserted = true;
          break;
        }
      }
      
      if (!importInserted) {
        // If no @/ imports found, add after last import
        for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].includes('import') && lines[i].includes(';')) {
            lines.splice(i + 1, 0, addImport);
            break;
          }
        }
      }
      
      content = lines.join('\n');
    }
    
    // Apply replacements
    replacements.forEach(({ search, replace }) => {
      content = content.replace(new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
    });
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Fixed ${file}`);
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log('Date fixes completed!');
