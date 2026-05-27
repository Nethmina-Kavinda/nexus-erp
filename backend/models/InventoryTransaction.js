const mongoose = require('mongoose');

const inventoryTransactionSchema = new mongoose.Schema(
  {
    inventory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
    },
    type: {
      type: String,
      enum: ['addition', 'shipment'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

inventoryTransactionSchema.index({ inventory_id: 1 });

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
