import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import UserActivity from '../models/UserActivity.js';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/:userId', expressAsyncHandler(async (req, res) => {
  const activities = await UserActivity.find({ user: req.params.userId }).select('product').distinct('product');
  
  let recommendations = [];
  if (activities.length > 0) {
    const lastProduct = await Product.findById(activities[activities.length - 1]);
    if(lastProduct) {
        recommendations = await Product.find({ category: lastProduct.category, _id: { $ne: lastProduct._id } }).limit(4);
    }
  }

  if (recommendations.length === 0) {
    recommendations = await Product.find({}).sort({ createdAt: -1 }).limit(4);
  }

  res.json(recommendations);
}));

router.post('/track', expressAsyncHandler(async (req, res) => {
  const { user, action, product } = req.body;
  if(user && action) {
    await UserActivity.create({ user, action, product });
    res.status(201).json({ message: 'Activity tracked' });
  } else {
    res.status(400); throw new Error('Invalid tracking layout');
  }
}));

export default router;
