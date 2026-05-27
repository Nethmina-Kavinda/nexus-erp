const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['raw_material', 'finished_good'],
      required: [true, 'Category is required'],
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    reorder_level: {
      type: Number,
      default: 0,
      min: 0,
    },
    lead_time: {
      type: Number,
      default: 0,
      min: 0,
    },
    safety_stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    unit_price: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', inventorySchema);
