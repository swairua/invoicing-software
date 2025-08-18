// Run this in the browser console to create sample data
async function createSampleDataNow() {
    console.log('🚀 Creating sample data via console...');
    
    try {
        const response = await fetch('/api/create-sample-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-company-id': '00000000-0000-0000-0000-000000000001'
            }
        });
        
        const result = await response.json();
        console.log('📊 Full result:', result);
        
        if (response.ok) {
            console.log('✅ Sample data created successfully!');
            console.log(`📁 Categories: ${result.summary.categoriesCreated}`);
            console.log(`👥 Customers: ${result.summary.customersCreated}`);
            console.log(`🏥 Products: ${result.summary.productsCreated}`);
            
            // Refresh the current page to see new data
            window.location.reload();
        } else {
            console.error('❌ Failed to create sample data:', result);
        }
    } catch (error) {
        console.error('❌ Network error:', error);
    }
}

// Auto-run
createSampleDataNow();
