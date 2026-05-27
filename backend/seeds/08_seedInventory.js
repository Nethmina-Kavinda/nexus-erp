/**
 * Seed step 8/8 — Inventory (15 items + 69 historical transactions).
 *
 * Standalone from the workforce pipeline; populates the Inventory module so
 * the demo includes a working operational ERP surface (raw materials and
 * finished goods). Several items are intentionally seeded near or below
 * their reorder level so the reorder-alert flag is visible without any
 * setup actions.
 *
 * Has no dependencies; can run independently of the workforce seeds.
 */
const Inventory = require('../models/Inventory');
const InventoryTransaction = require('../models/InventoryTransaction');

const INVENTORY_ITEMS = [
  // Raw Materials
  { name: 'Steel Sheets (Grade A)', category: 'raw_material', quantity: 450, reorder_level: 100, lead_time: 7, safety_stock: 50, unit_price: 2500, description: 'High-grade steel sheets for manufacturing' },
  { name: 'Copper Wire (500m rolls)', category: 'raw_material', quantity: 80, reorder_level: 30, lead_time: 5, safety_stock: 15, unit_price: 8500, description: 'Copper wire for electrical components' },
  { name: 'PVC Pipes (10ft)', category: 'raw_material', quantity: 200, reorder_level: 75, lead_time: 3, safety_stock: 25, unit_price: 350, description: 'Standard PVC pipes for plumbing assemblies' },
  { name: 'Rubber Gaskets (Assorted)', category: 'raw_material', quantity: 1200, reorder_level: 400, lead_time: 4, safety_stock: 100, unit_price: 45, description: 'Assorted rubber gaskets and seals' },
  { name: 'Aluminum Ingots', category: 'raw_material', quantity: 35, reorder_level: 20, lead_time: 10, safety_stock: 10, unit_price: 15000, description: 'Pure aluminum ingots for casting' },
  { name: 'Circuit Boards (PCB)', category: 'raw_material', quantity: 500, reorder_level: 150, lead_time: 14, safety_stock: 75, unit_price: 1200, description: 'Pre-manufactured PCB blanks' },
  { name: 'Packaging Foam Sheets', category: 'raw_material', quantity: 300, reorder_level: 100, lead_time: 3, safety_stock: 30, unit_price: 180, description: 'Protective foam for product packaging' },
  { name: 'Industrial Adhesive (5L)', category: 'raw_material', quantity: 25, reorder_level: 10, lead_time: 5, safety_stock: 5, unit_price: 4500, description: 'Heavy-duty industrial adhesive' },

  // Finished Goods
  { name: 'Power Distribution Unit v3', category: 'finished_good', quantity: 45, reorder_level: 15, lead_time: 0, safety_stock: 5, unit_price: 35000, description: 'Assembled power distribution panel' },
  { name: 'Control Module CM-200', category: 'finished_good', quantity: 120, reorder_level: 40, lead_time: 0, safety_stock: 15, unit_price: 8500, description: 'Programmable control module' },
  { name: 'Junction Box (Weather-proof)', category: 'finished_good', quantity: 250, reorder_level: 80, lead_time: 0, safety_stock: 20, unit_price: 2800, description: 'IP65-rated outdoor junction boxes' },
  { name: 'Cable Harness Assembly', category: 'finished_good', quantity: 60, reorder_level: 25, lead_time: 0, safety_stock: 10, unit_price: 12000, description: 'Custom cable harness for industrial machines' },
  { name: 'Sensor Array SA-100', category: 'finished_good', quantity: 30, reorder_level: 10, lead_time: 0, safety_stock: 5, unit_price: 22000, description: 'Multi-sensor array for monitoring systems' },
  { name: 'LED Panel Light (60x60)', category: 'finished_good', quantity: 180, reorder_level: 50, lead_time: 0, safety_stock: 20, unit_price: 4500, description: 'Commercial-grade LED ceiling panels' },
  { name: 'Transformer Unit TF-500', category: 'finished_good', quantity: 8, reorder_level: 5, lead_time: 0, safety_stock: 2, unit_price: 85000, description: 'Step-down transformer 500kVA' },
];

async function seedInventory() {
  await Inventory.deleteMany({});
  await InventoryTransaction.deleteMany({});

  const items = await Inventory.insertMany(INVENTORY_ITEMS);

  // Generate transaction history for each item
  const transactions = [];
  const now = new Date();

  for (const item of items) {
    // 3-6 transactions per item over last 3 months
    const numTransactions = 3 + Math.floor(Math.random() * 4);

    for (let t = 0; t < numTransactions; t++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);

      const isAddition = Math.random() < 0.5;
      const qty = isAddition
        ? Math.floor(20 + Math.random() * 100)
        : Math.floor(5 + Math.random() * 40);

      transactions.push({
        inventory_id: item._id,
        type: isAddition ? 'addition' : 'shipment',
        quantity: qty,
        date,
        notes: isAddition ? 'Supplier delivery' : 'Customer order fulfillment',
      });
    }
  }

  await InventoryTransaction.insertMany(transactions);

  const rawCount = items.filter((i) => i.category === 'raw_material').length;
  const finishedCount = items.filter((i) => i.category === 'finished_good').length;
  const alertCount = items.filter((i) => i.quantity <= i.reorder_level).length;

  console.log(`  Seeded ${items.length} inventory items (${rawCount} raw, ${finishedCount} finished)`);
  console.log(`  Seeded ${transactions.length} transactions`);
  console.log(`  Items below reorder level: ${alertCount}`);

  return items.length;
}

module.exports = seedInventory;
