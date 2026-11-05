const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Menu = require('../models/Menu');
const Order = require('../models/Order');
const User = require('../models/User');
const Counter = require('../models/Counter');
const TokenCounter = require('../models/TokenCounter');

const MENU_DATA = [
  {
    name: 'Paneer Tikka Kathi Roll',
    price: 90,
    category: 'Grills & Rolls',
    preparationTime: '4-5m',
    description: 'Charcoal grilled cottage cheese in handmade paratha',
    available: true,
  },
  {
    name: 'Crispy Veg Masala Burger',
    price: 80,
    category: 'Grills & Rolls',
    preparationTime: '3-4m',
    description: 'Herb patty, spiced coleslaw, and toasted sesame bun',
    available: true,
  },
  {
    name: 'Mysore Masala Dosa',
    price: 95,
    category: 'South Indian',
    preparationTime: '5-6m',
    description: 'Crisp crepe with red garlic chutney & spiced potato mash',
    available: true,
  },
  {
    name: 'Steamed Idli Sambar Platter',
    price: 65,
    category: 'South Indian',
    preparationTime: '2-3m',
    description: 'Fluffy rice cakes with aromatic drumstick lentil sambar',
    available: true,
  },
  {
    name: 'Hakka Chilli Garlic Noodles',
    price: 110,
    category: 'Meals & Bowls',
    preparationTime: '6-7m',
    description: 'Wok tossed noodles with crunchy garden vegetables',
    available: true,
  },
  {
    name: 'Chana Masala Rice Bowl',
    price: 120,
    category: 'Meals & Bowls',
    preparationTime: '4-5m',
    description: 'Slow simmered spiced chickpeas over fragrant jeera rice',
    available: true,
  },
  {
    name: 'Iced Hazelnut Cold Brew',
    price: 75,
    category: 'Beverages',
    preparationTime: '2m',
    description: '14-hour steep Arabica coffee with oat milk froth',
    available: true,
  },
  {
    name: 'Fresh Mint Lemon Cooler',
    price: 45,
    category: 'Beverages',
    preparationTime: '1-2m',
    description: 'Freshly squeezed lemon with crushed mint and black salt',
    available: true,
  },
  {
    name: 'Golden Salted French Fries',
    price: 60,
    category: 'Grills & Rolls',
    preparationTime: '3-4m',
    description: 'Double fried potato batons with peri-peri dust',
    available: true,
  },
];

const COUNTER_DATA = [
  {
    counterName: 'Counter A (Hot Grills)',
    supportedCategories: ['Grills & Rolls', 'Meals & Bowls'],
    isActive: true,
  },
  {
    counterName: 'Counter B (Beverages & Bakery)',
    supportedCategories: ['Beverages', 'Bakery & Snacks'],
    isActive: true,
  },
  {
    counterName: 'Counter C (South Indian)',
    supportedCategories: ['South Indian'],
    isActive: true,
  },
];

const USER_DATA = [
  {
    name: 'Administrator',
    email: 'admin@cafeteria.edu',
    password: 'Admin@Password123',
    role: 'admin',
  },
  {
    name: 'Head Chef Vikram',
    email: 'kitchen@cafeteria.edu',
    password: 'Kitchen@Password123',
    role: 'kitchen',
  },
  {
    name: 'Dispatcher Sunita',
    email: 'delivery@cafeteria.edu',
    password: 'Delivery@Password123',
    role: 'delivery',
  },
  {
    name: 'Student Aarav',
    email: 'student@cafeteria.edu',
    password: 'Student@Password123',
    role: 'student',
  },
];

const INITIAL_ORDERS_SEED = [
  {
    orderId: 'ord-101',
    tokenNumber: 101,
    studentName: 'Aarav Patel',
    orderType: 'dine-in',
    tableNumber: 'Table 4',
    counter: 'Counter A (Hot Grills)',
    status: 'ready',
    items: [
      { name: 'Paneer Tikka Kathi Roll', quantity: 1, price: 90 },
      { name: 'Iced Hazelnut Cold Brew', quantity: 1, price: 75 },
    ],
    totalAmount: 165,
    specialNotes: 'Extra spicy roll please',
  },
  {
    orderId: 'ord-102',
    tokenNumber: 102,
    studentName: 'Ananya Sharma',
    orderType: 'dine-out',
    tableNumber: 'Takeaway Pack',
    counter: 'Counter B (Beverages & Bakery)',
    status: 'ready',
    items: [
      { name: 'Iced Hazelnut Cold Brew', quantity: 2, price: 75 },
    ],
    totalAmount: 150,
    specialNotes: 'Less ice',
  },
  {
    orderId: 'ord-103',
    tokenNumber: 103,
    studentName: 'Rohan Mehta',
    orderType: 'dine-in',
    tableNumber: 'Table 9',
    counter: 'Counter A (Hot Grills)',
    status: 'cooking',
    items: [
      { name: 'Hakka Chilli Garlic Noodles', quantity: 1, price: 110 },
    ],
    totalAmount: 110,
    specialNotes: 'No onions',
  },
  {
    orderId: 'ord-104',
    tokenNumber: 104,
    studentName: 'Priya Iyer',
    orderType: 'dine-in',
    tableNumber: 'Table 2',
    counter: 'Counter C (South Indian)',
    status: 'cooking',
    items: [
      { name: 'Mysore Masala Dosa', quantity: 2, price: 95 },
    ],
    totalAmount: 190,
    specialNotes: 'Crispy ghee roast',
  },
  {
    orderId: 'ord-105',
    tokenNumber: 105,
    studentName: 'Kabir Verma',
    orderType: 'dine-out',
    tableNumber: 'Takeaway Pack',
    counter: 'Counter B (Beverages & Bakery)',
    status: 'ordered',
    items: [
      { name: 'Crispy Veg Masala Burger', quantity: 1, price: 80 },
      { name: 'Golden Salted French Fries', quantity: 1, price: 60 },
    ],
    totalAmount: 140,
    specialNotes: '',
  },
  {
    orderId: 'ord-106',
    tokenNumber: 106,
    studentName: 'Tanvi Nair',
    orderType: 'dine-in',
    tableNumber: 'Table 12',
    counter: 'Counter C (South Indian)',
    status: 'ordered',
    items: [
      { name: 'Steamed Idli Sambar Platter', quantity: 1, price: 65 },
    ],
    totalAmount: 65,
    specialNotes: 'Warm sambar in separate bowl',
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_cafeteria';
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Seeding!');

    // 1. Seed Menu Items
    console.log('Clearing existing Menu items...');
    await Menu.deleteMany({});
    const insertedMenu = await Menu.insertMany(MENU_DATA);
    console.log(`[Seed] Inserted ${insertedMenu.length} menu items successfully.`);

    // Map menu item names to DB _id
    const menuMap = {};
    insertedMenu.forEach((m) => {
      menuMap[m.name] = m._id;
    });

    // 2. Seed Counters
    console.log('Clearing existing Counters...');
    await Counter.deleteMany({});
    const insertedCounters = await Counter.insertMany(COUNTER_DATA);
    console.log(`[Seed] Inserted ${insertedCounters.length} counters successfully.`);

    // 3. Seed Users
    console.log('Clearing existing Users...');
    await User.deleteMany({});
    for (const u of USER_DATA) {
      await User.create(u);
    }
    console.log(`[Seed] Inserted ${USER_DATA.length} default users with hashed passwords.`);

    // 4. Seed Initial Orders
    console.log('Clearing existing Orders...');
    await Order.deleteMany({});
    const ordersToInsert = INITIAL_ORDERS_SEED.map((o) => ({
      ...o,
      items: o.items.map((i) => ({
        ...i,
        menuItemId: menuMap[i.name] || undefined,
      })),
    }));
    const insertedOrders = await Order.insertMany(ordersToInsert);
    console.log(`[Seed] Inserted ${insertedOrders.length} initial orders successfully.`);

    // 5. Seed / Sync TokenCounter
    const maxToken = insertedOrders.reduce((max, o) => Math.max(max, o.tokenNumber), 100);
    await TokenCounter.findOneAndUpdate(
      { _id: 'orderToken' },
      { seq: maxToken },
      { upsert: true, new: true }
    );
    console.log(`[Seed] TokenCounter initialized to ${maxToken}. Next order token will be ${maxToken + 1}.`);

    console.log('\n==========================================');
    console.log(' MongoDB Seeding Completed Successfully! ');
    console.log('==========================================');
    return true;
  } catch (error) {
    console.error('[Seed Error]:', error);
    throw error;
  }
};

const autoSeedIfEmpty = async () => {
  try {
    const count = await Menu.countDocuments();
    if (count === 0) {
      console.log('[Auto-Seed] Empty menu collection detected. Seeding default cafeteria catalog...');
      const insertedMenu = await Menu.insertMany(MENU_DATA);
      const menuMap = {};
      insertedMenu.forEach((m) => {
        menuMap[m.name] = m._id;
      });

      const counterCount = await Counter.countDocuments();
      if (counterCount === 0) {
        await Counter.insertMany(COUNTER_DATA);
      }

      const userCount = await User.countDocuments();
      if (userCount === 0) {
        for (const u of USER_DATA) {
          await User.create(u);
        }
      }

      const orderCount = await Order.countDocuments();
      if (orderCount === 0) {
        const ordersToInsert = INITIAL_ORDERS_SEED.map((o) => ({
          ...o,
          items: o.items.map((i) => ({
            ...i,
            menuItemId: menuMap[i.name] || undefined,
          })),
        }));
        await Order.insertMany(ordersToInsert);
      }

      await TokenCounter.findOneAndUpdate(
        { _id: 'orderToken' },
        { seq: 106 },
        { upsert: true, new: true }
      );
      console.log('[Auto-Seed] Successfully initialized menu, counters, and initial orders in MongoDB!');
    }
  } catch (e) {
    console.warn('[Auto-Seed Warning]:', e.message);
  }
};

if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedDatabase, autoSeedIfEmpty };

