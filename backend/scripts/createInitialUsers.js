const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const crypto = require('crypto');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Generate secure random password
const generateSecurePassword = () => {
  return crypto.randomBytes(16).toString('base64').slice(0, 20);
};

// Create initial users
const createUsers = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:', existingAdmin.email);
    } else {
      const adminPassword = generateSecurePassword();
      const admin = await User.create({
        email: 'admin@farmtocup.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        status: 'active',
        authProvider: 'local'
      });
      console.log('\n✅ Admin account created:');
      console.log('   Email:', admin.email);
      console.log('   Password:', adminPassword);
      console.log('   ⚠️  SAVE THIS PASSWORD - it will not be shown again!\n');
    }

    // Check if cashier already exists
    const existingCashier = await User.findOne({ role: 'cashier' });
    if (existingCashier) {
      console.log('⚠️  Cashier user already exists:', existingCashier.email);
    } else {
      const cashierPassword = generateSecurePassword();
      const cashier = await User.create({
        email: 'cashier@farmtocup.com',
        password: cashierPassword,
        firstName: 'Cashier',
        lastName: 'User',
        role: 'cashier',
        status: 'active',
        authProvider: 'local'
      });
      console.log('✅ Cashier account created:');
      console.log('   Email:', cashier.email);
      console.log('   Password:', cashierPassword);
      console.log('   ⚠️  SAVE THIS PASSWORD - it will not be shown again!\n');
    }

    console.log('\n📝 Next steps:');
    console.log('1. Save these credentials in a secure password manager');
    console.log('2. Share credentials with users via secure channel (encrypted email, password manager)');
    console.log('3. Users should change their passwords after first login via the app');
    console.log('4. Delete this script or restrict access to it\n');

  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Run the script
connectDB().then(createUsers);
