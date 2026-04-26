import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { saveProductImages } from '../middleware/uploadMiddleware.js';

const router = express.Router();

const parseJsonArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

router.get('/', expressAsyncHandler(async (req, res) => {
  const { gender, category, minPrice, maxPrice, brand, search, sort } = req.query;
  const filter = {};
  
  if (gender) filter.gender = { $in: [gender, 'Unisex'] };
  if (category && category !== 'All') filter.category = category;
  if (brand) filter.brand = brand;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  let sortCriteria = {};
  switch(sort) {
    case 'priceLowHigh': sortCriteria = { price: 1 }; break;
    case 'priceHighLow': sortCriteria = { price: -1 }; break;
    case 'newest': sortCriteria = { createdAt: -1 }; break;
    case 'popular': sortCriteria = { ratings: -1 }; break;
    default: sortCriteria = { createdAt: -1 };
  }

  const products = await Product.find(filter).sort(sortCriteria);
  res.json(products);
}));

router.get('/:id', expressAsyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
}));

// Admin Route: Create new product
router.post('/', protect, admin, expressAsyncHandler(async (req, res) => {
  const submittedImages = parseJsonArray(req.body.images);
  const images = saveProductImages(req, submittedImages, req.body.name);
  const variants = parseJsonArray(req.body.variants);

  const product = new Product({
      name: req.body.name || 'Sample Product',
      description: req.body.description || '',
      price: Number(req.body.price || 0),
      originalPrice: Number(req.body.discountPrice || req.body.originalPrice || 0),
      image: images[0] || req.body.image || '',
      images,
      category: req.body.category || 'General',
      gender: req.body.gender || req.body.category || 'Unisex',
      brand: req.body.brand || 'Apparel',
      variants,
      stock: Number(req.body.stock || 0),
   });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
}));

// Admin Route: Update existing product
router.put('/:id', protect, admin, expressAsyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.price = req.body.price !== undefined ? Number(req.body.price) : product.price;
    product.originalPrice = req.body.discountPrice !== undefined || req.body.originalPrice !== undefined
      ? Number(req.body.discountPrice || req.body.originalPrice || product.originalPrice)
      : product.originalPrice;
    product.category = req.body.category || product.category;
    product.gender = req.body.gender || req.body.category || product.gender;
    product.stock = req.body.stock !== undefined ? Number(req.body.stock) : product.stock;
    if (req.body.images) {
      const images = saveProductImages(req, parseJsonArray(req.body.images), req.body.name || product.name);
      product.images = images.length ? images : product.images;
      product.image = images[0] || product.image;
    }
    const variants = parseJsonArray(req.body.variants);
    if (variants.length) product.variants = variants;
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404); throw new Error('Product not found');
  }
}));

// Admin Route: Delete product
router.delete('/:id', protect, admin, expressAsyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product permanently purged' });
  } else {
    res.status(404); throw new Error('Product not found');
  }
}));

export default router;
