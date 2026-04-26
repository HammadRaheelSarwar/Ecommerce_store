import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  size: { type: String },
  color: { type: String },
  stock: { type: Number, required: true, default: 0 },
  priceDifference: { type: Number, default: 0 }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  image: { type: String }, /* keeping legacy fallback */
  images: [{ type: String }],
  model3d: { type: String },
  category: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Unisex'], required: true },
  brand: { type: String },
  material: { type: String },
  variants: [variantSchema],
  stock: { type: Number, required: true, default: 0 }, 
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;
