const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('🔄 Testing MongoDB Connection...\n');
console.log('Connection String:', process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('\n✅ SUCCESS! MongoDB Connected');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('\n🎉 Your database is ready to use!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ CONNECTION FAILED!');
    console.error('Error:', err.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Check your MONGODB_URI in .env file');
    console.log('2. Verify your username and password');
    console.log('3. Make sure your IP is whitelisted in MongoDB Atlas');
    console.log('4. Check if special characters in password are URL encoded');
    process.exit(1);
  });
