const mysql = require('mysql2/promise');

async function addQuotationItems() {
    const connection = await mysql.createConnection({
        host: 'mysql-242eb3d7-invoicing-software.c.aivencloud.com',
        port: 11397,
        user: 'avnadmin',
        password: 'AVNS_x9WdjKNy72pMT6Zr90I',
        database: 'defaultdb',
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('🔗 Connected to MySQL database');

        // First, let's get some products to use
        const [products] = await connection.execute(
            'SELECT * FROM products WHERE company_id = ? LIMIT 3',
            ['00000000-0000-0000-0000-000000000001']
        );

        console.log('📦 Found products:', products.map(p => ({ id: p.id, name: p.name, price: p.selling_price })));

        if (products.length === 0) {
            console.log('❌ No products found');
            return;
        }

        const quotationId = '5ad9b23e-9b3b-46b9-a2b9-1e242ae47955';

        // Add items for this quotation
        const items = [
            {
                productId: products[0].id,
                description: products[0].name,
                quantity: 10,
                unitPrice: products[0].selling_price,
                discountPercentage: 5,
                vatRate: 16,
                sortOrder: 0
            },
            {
                productId: products[1]?.id || products[0].id,
                description: products[1]?.name || products[0].name,
                quantity: 5,
                unitPrice: products[1]?.selling_price || products[0].selling_price,
                discountPercentage: 10,
                vatRate: 16,
                sortOrder: 1
            }
        ];

        // Delete existing items first (if any)
        await connection.execute(
            'DELETE FROM quotation_items WHERE quotation_id = ?',
            [quotationId]
        );

        // Insert new items
        for (const item of items) {
            const subtotal = item.quantity * item.unitPrice;
            const discountAmount = (subtotal * item.discountPercentage) / 100;
            const afterDiscount = subtotal - discountAmount;
            const vatAmount = (afterDiscount * item.vatRate) / 100;
            const lineTotal = afterDiscount + vatAmount;

            await connection.execute(`
                INSERT INTO quotation_items 
                (id, quotation_id, product_id, description, quantity, unit_price, 
                 discount_percentage, vat_rate, vat_amount, line_total, sort_order)
                VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                quotationId,
                item.productId,
                item.description,
                item.quantity,
                item.unitPrice,
                item.discountPercentage,
                item.vatRate,
                vatAmount,
                lineTotal,
                item.sortOrder
            ]);

            console.log(`✅ Added item: ${item.description} x${item.quantity} @ ${item.unitPrice}`);
        }

        // Update quotation totals
        const [itemsTotal] = await connection.execute(`
            SELECT 
                SUM(quantity * unit_price) as subtotal,
                SUM((quantity * unit_price * discount_percentage) / 100) as discount_amount,
                SUM(vat_amount) as vat_amount,
                SUM(line_total) as total
            FROM quotation_items 
            WHERE quotation_id = ?
        `, [quotationId]);

        const totals = itemsTotal[0];

        await connection.execute(`
            UPDATE quotations 
            SET subtotal = ?, discount_amount = ?, vat_amount = ?, total_amount = ?
            WHERE id = ?
        `, [
            totals.subtotal || 0,
            totals.discount_amount || 0,
            totals.vat_amount || 0,
            totals.total || 0,
            quotationId
        ]);

        console.log('📊 Updated quotation totals:', totals);
        console.log('✅ Successfully added items to quotation');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

addQuotationItems();
