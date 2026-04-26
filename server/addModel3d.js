import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

// Connect to testing/local DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/allavailable')
  .then(async () => {
    console.log('MongoDB connected. Injecting dummy 3D model...');
    
    // We update the first product we find to have a true GLB model
    // Here is a public model from Google's model-viewer repo for an Astronaut
    const modelUrl = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';
    
    const product = await Product.findOne({});
    if (product) {
      product.model3d = modelUrl;
      await product.save();
      console.log(`Updated product "${product.name}" with 3D model: ${modelUrl}`);
    } else {
      console.log('No products found in DB to update.');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
