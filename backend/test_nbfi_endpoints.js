// Test NBFI endpoints with chain-based table selection
const http = require('http');

const baseURL = 'http://localhost:3001/api';

function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', reject);
  });
}

async function testNBFIEndpoints() {
  console.log('\n==========================================');
  console.log('Testing NBFI Endpoints');
  console.log('==========================================\n');
  
  // Test parameters
  const chain = 'SM';  // SM OUTRIGHT -> SM
  const category = 'BARBIZON';  // Brand
  const storeClass = 'ASEH';  // A Stores - Extra High -> ASEH
  
  console.log('Test Parameters:');
  console.log('  Chain:', chain, '(SM OUTRIGHT)');
  console.log('  Brand:', category, '(BARBIZON)');
  console.log('  Store Class:', storeClass, '(A Stores - Extra High)');
  console.log('\n==========================================\n');

  try {
    // Test 1: Get exclusivity items
    console.log('TEST 1: GET /api/filters/nbfi/exclusivity-items');
    const url1 = `${baseURL}/filters/nbfi/exclusivity-items?chain=${chain}&category=${category}&storeClass=${storeClass}`;
    console.log(`URL: ${url1}`);
    try {
      const res1 = await httpGet(url1);
      if (res1.status === 200) {
        console.log('✅ SUCCESS');
        console.log('Response:', JSON.stringify(res1.data, null, 2));
        console.log(`Items returned: ${res1.data.items?.length || 0}`);
      } else {
        console.log('❌ FAILED');
        console.log('Status:', res1.status);
        console.log('Error:', res1.data);
      }
    } catch (err) {
      console.log('❌ FAILED');
      console.log('Error:', err.message);
    }

    console.log('\n------------------------------------------\n');

    // Test 2: Get items for assignment
    console.log('TEST 2: GET /api/filters/nbfi/items-for-assignment');
    const url2 = `${baseURL}/filters/nbfi/items-for-assignment?chain=${chain}&category=${category}&storeClass=${storeClass}`;
    console.log(`URL: ${url2}`);
    try {
      const res2 = await httpGet(url2);
      if (res2.status === 200) {
        console.log('✅ SUCCESS');
        console.log('Response:', JSON.stringify(res2.data, null, 2));
        console.log(`Available items: ${res2.data.items?.length || 0}`);
      } else {
        console.log('❌ FAILED');
        console.log('Status:', res2.status);
        console.log('Error:', res2.data);
      }
    } catch (err) {
      console.log('❌ FAILED');
      console.log('Error:', err.message);
    }

    console.log('\n------------------------------------------\n');

    // Test 3: Get stores/branches
    console.log('TEST 3: GET /api/filters/nbfi/stores');
    const url3 = `${baseURL}/filters/nbfi/stores?chain=${chain}&category=${category}&storeClass=${storeClass}`;
    console.log(`URL: ${url3}`);
    try {
      const res3 = await httpGet(url3);
      if (res3.status === 200) {
        console.log('✅ SUCCESS');
        console.log('Response:', JSON.stringify(res3.data, null, 2));
        console.log(`Stores returned: ${res3.data.items?.length || 0}`);
        if (res3.data.items?.length > 0) {
          console.log('\nFirst store details:');
          console.log('  Branch Code:', res3.data.items[0].branchCode);
          console.log('  Branch Name:', res3.data.items[0].branchName);
          console.log('  Excluded Items:', res3.data.items[0].excludedItemIds?.length || 0);
        }
      } else {
        console.log('❌ FAILED');
        console.log('Status:', res3.status);
        console.log('Error:', res3.data);
      }
    } catch (err) {
      console.log('❌ FAILED');
      console.log('Error:', err.message);
    }

    console.log('\n==========================================');
    console.log('All tests completed');
    console.log('==========================================\n');

  } catch (error) {
    console.error('\n❌ UNEXPECTED ERROR:', error.message);
  }
}

// Run the tests
testNBFIEndpoints().catch(console.error);
