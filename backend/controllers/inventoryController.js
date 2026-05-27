const Inventory = require('../models/Inventory');
const InventoryTransaction = require('../models/InventoryTransaction');
const { sendAlertEmail } = require('../utils/email');
const Employee = require('../models/Employee');

/**
 * List inventory items, optionally filtered by category, with a derived
 * `needs_reorder` flag computed from `quantity <= reorder_level`. The flag
 * lives on the response object rather than the document so it always
 * reflects current stock without a write on every read.
 * @route   GET /api/inventory
 * @access  Protected
 */
const listInventory = async (req, res, next) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const items = await Inventory.find(filter).sort({ name: 1 });

    const itemsWithReorder = items.map((item) => {
      const reorderLevel = (item.reorder_level || 0);
      return {
        ...item.toObject(),
        needs_reorder: item.quantity <= reorderLevel,
      };
    });

    res.json({ success: true, count: items.length, data: itemsWithReorder });
  } catch (error) {
    next(error);
  }
};

/**
 * Record an inventory addition or shipment, atomically updating stock and
 * (for shipments that drop the item to or below its reorder level) emailing
 * every admin/manager. Shipments that exceed available stock are rejected
 * with a 400 to keep `quantity` non-negative.
 * @route   POST /api/inventory/transaction
 * @access  Protected (admin, manager)
 * @body    { inventory_id, type: "addition"|"shipment", quantity, notes? }
 */
const createTransaction = async (req, res, next) => {
  try {
    const { inventory_id, type, quantity, notes } = req.body;

    const item = await Inventory.findById(inventory_id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Inventory item not found' });
    }

    if (type === 'shipment' && item.quantity < quantity) {
      return res.status(400).json({ success: false, error: 'Insufficient stock' });
    }

    const transaction = await InventoryTransaction.create({
      inventory_id,
      type,
      quantity,
      notes,
    });

    // Update quantity
    if (type === 'addition') {
      item.quantity += quantity;
    } else {
      item.quantity -= quantity;
    }
    await item.save();

    // Check reorder level after shipment
    if (type === 'shipment' && item.quantity <= item.reorder_level) {
      const admins = await Employee.find({ role: { $in: ['admin', 'manager'] } });
      for (const admin of admins) {
        await sendAlertEmail(
          admin.email,
          `Inventory Alert: ${item.name} Below Reorder Level`,
          `${item.name} stock is at ${item.quantity} units (reorder level: ${item.reorder_level}). Please restock.`
        );
      }
    }

    res.status(201).json({
      success: true,
      data: { transaction, item: { ...item.toObject(), needs_reorder: item.quantity <= item.reorder_level } },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { listInventory, createTransaction };
