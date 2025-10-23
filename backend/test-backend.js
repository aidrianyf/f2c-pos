const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test results storage
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(testName, passed, message = '') {
  if (passed) {
    results.passed++;
    console.log(`✅ ${testName}`);
  } else {
    results.failed++;
    console.log(`❌ ${testName}`);
    if (message) console.log(`   Error: ${message}`);
  }
  results.tests.push({ name: testName, passed, message });
}

// Helper to extract cookie from response
function extractCookie(response) {
  const cookies = response.headers['set-cookie'];
  if (cookies && cookies.length > 0) {
    const tokenCookie = cookies.find(c => c.startsWith('token='));
    if (tokenCookie) {
      return tokenCookie.split(';')[0];
    }
  }
  return null;
}

// Storage for test data
let adminToken = '';
let cashierToken = '';
let productId = '';
let categoryId = '';
let orderId = '';

async function runTests() {
  console.log('\n🧪 Starting Backend API Tests...\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // ============================================
    // 1. AUTHENTICATION TESTS
    // ============================================
    console.log('📝 1. AUTHENTICATION FLOW\n');

    // Test 1.1: Health Check
    try {
      const response = await axios.get(`${BASE_URL}/health`);
      logTest('1.1 Health Check', response.data.success === true);
    } catch (error) {
      logTest('1.1 Health Check', false, error.message);
    }

    // Test 1.2: Admin Login
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@farmtocup.com',
        password: 'Admin@123'
      });
      adminToken = extractCookie(response);
      logTest('1.2 Admin Login', response.data.success === true && adminToken !== null);
    } catch (error) {
      logTest('1.2 Admin Login', false, error.response?.data?.message || error.message);
    }

    // Test 1.3: Cashier Login
    try {
      const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'cashier@farmtocup.com',
        password: 'Cashier@123'
      });
      cashierToken = extractCookie(response);
      logTest('1.3 Cashier Login', response.data.success === true && cashierToken !== null);
    } catch (error) {
      logTest('1.3 Cashier Login', false, error.response?.data?.message || error.message);
    }

    // Test 1.4: Get Admin Profile
    try {
      const response = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Cookie: adminToken }
      });
      logTest('1.4 Get Admin Profile', response.data.user.role === 'admin');
    } catch (error) {
      logTest('1.4 Get Admin Profile', false, error.response?.data?.message || error.message);
    }

    // Test 1.5: Invalid Login
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@farmtocup.com',
        password: 'WrongPassword'
      });
      logTest('1.5 Invalid Login Protection', false, 'Should have failed');
    } catch (error) {
      logTest('1.5 Invalid Login Protection', error.response?.status === 401);
    }

    console.log('\n');

    // ============================================
    // 2. CATEGORY TESTS
    // ============================================
    console.log('📂 2. CATEGORY MANAGEMENT\n');

    // Test 2.1: Get All Categories
    try {
      const response = await axios.get(`${BASE_URL}/categories`);
      categoryId = response.data.categories[0]._id;
      logTest('2.1 Get All Categories', response.data.categories.length > 0);
    } catch (error) {
      logTest('2.1 Get All Categories', false, error.response?.data?.message || error.message);
    }

    // Test 2.2: Create Category (Admin)
    try {
      const response = await axios.post(`${BASE_URL}/categories`, {
        name: 'Test Category',
        description: 'Testing category creation',
        displayOrder: 99
      }, {
        headers: { Cookie: adminToken }
      });
      logTest('2.2 Create Category (Admin)', response.data.success === true);
    } catch (error) {
      logTest('2.2 Create Category (Admin)', false, error.response?.data?.message || error.message);
    }

    console.log('\n');

    // ============================================
    // 3. PRODUCT TESTS
    // ============================================
    console.log('☕ 3. PRODUCT MANAGEMENT\n');

    // Test 3.1: Get All Products
    try {
      const response = await axios.get(`${BASE_URL}/products`);
      productId = response.data.products[0]._id;
      logTest('3.1 Get All Products', response.data.products.length > 0);
    } catch (error) {
      logTest('3.1 Get All Products', false, error.response?.data?.message || error.message);
    }

    // Test 3.2: Get Single Product
    try {
      const response = await axios.get(`${BASE_URL}/products/${productId}`);
      logTest('3.2 Get Single Product', response.data.product._id === productId);
    } catch (error) {
      logTest('3.2 Get Single Product', false, error.response?.data?.message || error.message);
    }

    // Test 3.3: Create Product (Admin)
    try {
      const response = await axios.post(`${BASE_URL}/products`, {
        name: 'Test Product',
        description: 'Testing product creation',
        category: categoryId,
        variants: [
          { size: '12oz', temperature: 'hot', price: 100, cost: 50 }
        ],
        modifiers: [
          { name: 'Extra Sugar', price: 10 }
        ]
      }, {
        headers: { Cookie: adminToken }
      });
      logTest('3.3 Create Product (Admin)', response.data.success === true);
    } catch (error) {
      logTest('3.3 Create Product (Admin)', false, error.response?.data?.message || error.message);
    }

    // Test 3.4: Cashier Cannot Create Product
    try {
      await axios.post(`${BASE_URL}/products`, {
        name: 'Should Fail',
        category: categoryId,
        variants: [{ size: '12oz', temperature: 'hot', price: 100 }]
      }, {
        headers: { Cookie: cashierToken }
      });
      logTest('3.4 Cashier Cannot Create Product', false, 'Should have been blocked');
    } catch (error) {
      logTest('3.4 Cashier Cannot Create Product', error.response?.status === 403);
    }

    console.log('\n');

    // ============================================
    // 4. DISCOUNT TESTS
    // ============================================
    console.log('💰 4. DISCOUNT MANAGEMENT\n');

    // Test 4.1: Create Discount (Admin)
    try {
      const response = await axios.post(`${BASE_URL}/discounts`, {
        code: 'TEST10',
        name: 'Test Discount',
        type: 'percentage',
        value: 10,
        minPurchase: 100,
        isActive: true
      }, {
        headers: { Cookie: adminToken }
      });
      logTest('4.1 Create Discount Code (Admin)', response.data.success === true);
    } catch (error) {
      logTest('4.1 Create Discount Code (Admin)', false, error.response?.data?.message || error.message);
    }

    // Test 4.2: Validate Discount Code
    try {
      const response = await axios.get(`${BASE_URL}/discounts/validate/TEST10?subtotal=200`, {
        headers: { Cookie: cashierToken }
      });
      logTest('4.2 Validate Discount Code', response.data.success === true);
    } catch (error) {
      logTest('4.2 Validate Discount Code', false, error.response?.data?.message || error.message);
    }

    console.log('\n');

    // ============================================
    // 5. ORDER TESTS (POS FLOW)
    // ============================================
    console.log('🛒 5. ORDER CREATION (POS)\n');

    // Test 5.1: Create Order Without Discount
    try {
      const response = await axios.post(`${BASE_URL}/orders`, {
        items: [
          {
            product: productId,
            size: '12oz',
            temperature: 'hot',
            quantity: 2,
            modifiers: []
          }
        ],
        paymentMethod: 'cash',
        amountPaid: 500
      }, {
        headers: { Cookie: cashierToken }
      });
      orderId = response.data.order._id;
      logTest('5.1 Create Order Without Discount', response.data.success === true);
    } catch (error) {
      logTest('5.1 Create Order Without Discount', false, error.response?.data?.message || error.message);
    }

    // Test 5.2: Create Order With Discount
    try {
      const response = await axios.post(`${BASE_URL}/orders`, {
        items: [
          {
            product: productId,
            size: '16oz',
            temperature: 'iced',
            quantity: 1,
            modifiers: []
          }
        ],
        discountCode: 'TEST10',
        paymentMethod: 'gcash',
        amountPaid: 200
      }, {
        headers: { Cookie: cashierToken }
      });
      logTest('5.2 Create Order With Discount', response.data.success === true && response.data.order.discountAmount > 0);
    } catch (error) {
      logTest('5.2 Create Order With Discount', false, error.response?.data?.message || error.message);
    }

    // Test 5.3: Get Orders (Cashier)
    try {
      const response = await axios.get(`${BASE_URL}/orders`, {
        headers: { Cookie: cashierToken }
      });
      logTest('5.3 Get Orders (Cashier)', response.data.orders.length > 0);
    } catch (error) {
      logTest('5.3 Get Orders (Cashier)', false, error.response?.data?.message || error.message);
    }

    // Test 5.4: Get Single Order
    try {
      const response = await axios.get(`${BASE_URL}/orders/${orderId}`, {
        headers: { Cookie: cashierToken }
      });
      logTest('5.4 Get Single Order', response.data.order._id === orderId);
    } catch (error) {
      logTest('5.4 Get Single Order', false, error.response?.data?.message || error.message);
    }

    console.log('\n');

    // ============================================
    // 6. ANALYTICS TESTS
    // ============================================
    console.log('📊 6. ANALYTICS & REPORTS\n');

    // Test 6.1: Dashboard Stats (Admin)
    try {
      const response = await axios.get(`${BASE_URL}/analytics/dashboard`, {
        headers: { Cookie: adminToken }
      });
      logTest('6.1 Get Dashboard Stats (Admin)', response.data.stats !== undefined);
    } catch (error) {
      logTest('6.1 Get Dashboard Stats (Admin)', false, error.response?.data?.message || error.message);
    }

    // Test 6.2: Sales Report (Admin)
    try {
      const response = await axios.get(`${BASE_URL}/analytics/sales?groupBy=day`, {
        headers: { Cookie: adminToken }
      });
      logTest('6.2 Get Sales Report (Admin)', response.data.success === true);
    } catch (error) {
      logTest('6.2 Get Sales Report (Admin)', false, error.response?.data?.message || error.message);
    }

    // Test 6.3: Product Performance (Admin)
    try {
      const response = await axios.get(`${BASE_URL}/analytics/products`, {
        headers: { Cookie: adminToken }
      });
      logTest('6.3 Get Product Performance (Admin)', response.data.success === true);
    } catch (error) {
      logTest('6.3 Get Product Performance (Admin)', false, error.response?.data?.message || error.message);
    }

    // Test 6.4: Cashier Cannot Access Analytics
    try {
      await axios.get(`${BASE_URL}/analytics/dashboard`, {
        headers: { Cookie: cashierToken }
      });
      logTest('6.4 Cashier Cannot Access Analytics', false, 'Should have been blocked');
    } catch (error) {
      logTest('6.4 Cashier Cannot Access Analytics', error.response?.status === 403);
    }

    console.log('\n');

    // ============================================
    // 7. USER MANAGEMENT TESTS
    // ============================================
    console.log('👥 7. USER MANAGEMENT\n');

    // Test 7.1: Get All Users (Admin)
    try {
      const response = await axios.get(`${BASE_URL}/users`, {
        headers: { Cookie: adminToken }
      });
      logTest('7.1 Get All Users (Admin)', response.data.users.length >= 2);
    } catch (error) {
      logTest('7.1 Get All Users (Admin)', false, error.response?.data?.message || error.message);
    }

    // Test 7.2: Cashier Cannot Get Users
    try {
      await axios.get(`${BASE_URL}/users`, {
        headers: { Cookie: cashierToken }
      });
      logTest('7.2 Cashier Cannot Get Users', false, 'Should have been blocked');
    } catch (error) {
      logTest('7.2 Cashier Cannot Get Users', error.response?.status === 403);
    }

    console.log('\n');

  } catch (error) {
    console.error('Unexpected error during tests:', error.message);
  }

  // ============================================
  // SUMMARY
  // ============================================
  console.log('═══════════════════════════════════════════════════\n');
  console.log('📊 TEST SUMMARY\n');
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%\n`);

  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Backend is working perfectly!\n');
    console.log('✅ Ready to start building the frontend!\n');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.\n');
    console.log('Failed tests:');
    results.tests
      .filter(t => !t.passed)
      .forEach(t => console.log(`  - ${t.name}: ${t.message}`));
    console.log('');
  }

  process.exit(results.failed === 0 ? 0 : 1);
}

// Run the tests
runTests();
