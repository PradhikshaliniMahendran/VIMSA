import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/ProductSchema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '../../.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
console.log('Dotenv result:', result.error ? 'Error loading .env' : 'Success');
async function migrateSizes() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const products = await Product.find({});
        console.log(`Found ${products.length} products to check.`);

        let updatedCount = 0;

        for (const product of products) {
            let needsUpdate = false;
            const newSizes = [];

            if (product.sizes && product.sizes.length > 0) {
                for (const size of product.sizes) {
                    if (typeof size === 'string') {
                        // It's an old string size
                        needsUpdate = true;
                        newSizes.push({
                            name: size,
                            stock: Math.floor(product.stockQuantity / product.sizes.length) || 0 // Distribute stock evenly for now
                        });
                    } else if (typeof size === 'object' && size.name) {
                        // Already migrated
                        newSizes.push(size);
                    }
                }
            }

            if (needsUpdate) {
                await Product.updateOne(
                    { _id: product._id },
                    { $set: { sizes: newSizes } }
                );
                console.log(`Migrated sizes for product: ${product.name}`);
                updatedCount++;
            }
        }

        console.log(`Migration complete! Updated ${updatedCount} products.`);
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        mongoose.connection.close();
    }
}

migrateSizes();
