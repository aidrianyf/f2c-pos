const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    console.log('Cleared existing data...');

    // Create Admin User
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'FarmToCup',
      email: 'admin@farmtocup.com',
      password: 'Admin@123',
      role: 'admin'
    });

    // Create Cashier User
    const cashier = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'cashier@farmtocup.com',
      password: 'Cashier@123',
      role: 'cashier'
    });

    console.log('Users created...');

    // Create Categories
    const categories = await Category.create([
      {
        name: 'Coffee',
        description: 'Hot and iced coffee beverages',
        icon: '☕',
        displayOrder: 1
      },
      {
        name: 'Non-Coffee',
        description: 'Non-coffee beverages',
        icon: '🥤',
        displayOrder: 2
      },
      {
        name: 'Tea Series',
        description: 'Various tea options',
        icon: '🍵',
        displayOrder: 3
      },
      {
        name: 'Milky Series',
        description: 'Milk-based drinks',
        icon: '🥛',
        displayOrder: 4
      },
      {
        name: 'Frappe & Milkshakes',
        description: 'Blended beverages',
        icon: '🥤',
        displayOrder: 5
      },
      {
        name: 'Italian Soda',
        description: 'Refreshing Italian sodas',
        icon: '🥤',
        displayOrder: 6
      },
      {
        name: 'Must Try',
        description: 'Signature drinks',
        icon: '⭐',
        displayOrder: 7
      }
    ]);

    console.log('Categories created...');

    // Get category IDs
    const coffeeCategory = categories.find(c => c.name === 'Coffee');
    const nonCoffeeCategory = categories.find(c => c.name === 'Non-Coffee');
    const teaCategory = categories.find(c => c.name === 'Tea Series');
    const milkyCategory = categories.find(c => c.name === 'Milky Series');
    const frappeCategory = categories.find(c => c.name === 'Frappe & Milkshakes');
    const sodaCategory = categories.find(c => c.name === 'Italian Soda');
    const mustTryCategory = categories.find(c => c.name === 'Must Try');

    // Create Sample Products
    await Product.create([
      // Coffee
      {
        name: 'Americano',
        description: 'Classic espresso with hot water',
        category: coffeeCategory._id,
        variants: [
          { size: '12oz', temperature: 'hot', price: 160, cost: 50 },
          { size: '16oz', temperature: 'iced', price: 160, cost: 55 }
        ],
        modifiers: [
          { name: 'Extra Shot', price: 30 },
          { name: 'Whipped Cream', price: 20 }
        ],
        isAvailable: true,
        isFeatured: true
      },
      {
        name: 'Cappuccino',
        description: 'Espresso with steamed milk foam',
        category: coffeeCategory._id,
        variants: [
          { size: '12oz', temperature: 'hot', price: 160, cost: 55 },
          { size: '16oz', temperature: 'iced', price: 160, cost: 60 }
        ],
        modifiers: [
          { name: 'Extra Shot', price: 30 },
          { name: 'Vanilla Syrup', price: 20 }
        ],
        isAvailable: true
      },
      {
        name: 'Caramel Macchiato',
        description: 'Espresso with vanilla and caramel',
        category: coffeeCategory._id,
        variants: [
          { size: '12oz', temperature: 'hot', price: 160, cost: 60 },
          { size: '16oz', temperature: 'iced', price: 160, cost: 65 }
        ],
        modifiers: [
          { name: 'Extra Caramel', price: 20 }
        ],
        isAvailable: true,
        isFeatured: true
      },

      // Milky Series
      {
        name: 'Chocolate Milk',
        description: 'Rich chocolate milk drink',
        category: milkyCategory._id,
        variants: [
          { size: '12oz', temperature: 'hot', price: 160, cost: 50 },
          { size: '16oz', temperature: 'iced', price: 160, cost: 55 }
        ],
        modifiers: [
          { name: 'Whipped Cream', price: 20 }
        ],
        isAvailable: true
      },

      // Frappe & Milkshakes
      {
        name: 'Mocha Frappe',
        description: 'Blended coffee with chocolate',
        category: frappeCategory._id,
        variants: [
          { size: '16oz', temperature: 'blended', price: 180, cost: 70 }
        ],
        modifiers: [
          { name: 'Whipped Cream', price: 20 },
          { name: 'Extra Shot', price: 30 }
        ],
        isAvailable: true,
        isFeatured: true
      },
      {
        name: 'Cookies & Cream Milkshake',
        description: 'Blended cookies and cream',
        category: frappeCategory._id,
        variants: [
          { size: '16oz', temperature: 'blended', price: 180, cost: 65 }
        ],
        modifiers: [
          { name: 'Whipped Cream', price: 20 }
        ],
        isAvailable: true
      },

      // Italian Soda
      {
        name: 'Lemon Italian Soda',
        description: 'Refreshing lemon soda',
        category: sodaCategory._id,
        variants: [
          { size: '16oz', temperature: 'iced', price: 85, cost: 30 }
        ],
        modifiers: [],
        isAvailable: true
      },
      {
        name: 'Strawberry Italian Soda',
        description: 'Sweet strawberry soda',
        category: sodaCategory._id,
        variants: [
          { size: '16oz', temperature: 'iced', price: 85, cost: 30 }
        ],
        modifiers: [],
        isAvailable: true
      },

      // Tea Series
      {
        name: 'Lemon Tea',
        description: 'Fresh lemon tea',
        category: teaCategory._id,
        variants: [
          { size: '12oz', temperature: 'hot', price: 160, cost: 40 },
          { size: '16oz', temperature: 'iced', price: 160, cost: 45 }
        ],
        modifiers: [
          { name: 'Extra Honey', price: 15 }
        ],
        isAvailable: true
      }
    ]);

    console.log('Products created...');
    console.log('\n========================================');
    console.log('✅ Database seeded successfully!');
    console.log('========================================');
    console.log('\nDefault Accounts:');
    console.log('Admin:');
    console.log('  Email: admin@farmtocup.com');
    console.log('  Password: Admin@123');
    console.log('\nCashier:');
    console.log('  Email: cashier@farmtocup.com');
    console.log('  Password: Cashier@123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
