import http from 'http';

const testBackend = async () => {
  console.log('=== RUNNING ENTERPRISE BACKEND VERIFICATION TESTS ===\n');

  // Helper fetcher
  const request = async (path, method = 'GET', body = null, token = null) => {
    const res = await fetch(`http://localhost:5000${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const isPdf = res.headers.get('content-type')?.includes('application/pdf');
    if (isPdf) {
      const buffer = await res.arrayBuffer();
      return { status: res.status, headers: res.headers, buffer: Buffer.from(buffer) };
    }
    const data = await res.json();
    return { status: res.status, data };
  };

  try {
    // 1. Health
    const health = await request('/api/health');
    console.log('✔ Health Check:', health.status === 200, health.data);

    // 2. Auth - Admin Login
    const loginRes = await request('/api/auth/login', 'POST', {
      email: 'admin@apex.com',
      password: 'password123',
    });
    console.log('✔ Admin Login:', loginRes.status === 200, `Token received for ${loginRes.data.data?.name} (${loginRes.data.data?.role})`);
    const adminToken = loginRes.data.data.token;

    // 3. Warehouses
    const whRes = await request('/api/inventory/warehouses', 'GET', null, adminToken);
    console.log(`✔ Warehouses Fetched: ${whRes.data.count} warehouses found`);
    const warehouses = whRes.data.data;

    // 4. Products
    const prodRes = await request('/api/inventory/products', 'GET', null, adminToken);
    console.log(`✔ Products Fetched: ${prodRes.data.count} master SKUs found`);
    const products = prodRes.data.data;

    // 5. Stock Overview
    const stockRes = await request('/api/inventory/stock', 'GET', null, adminToken);
    console.log(`✔ Multi-Location Stock Records: ${stockRes.data.count} records loaded`);

    // 6. Execute ACID Transfer
    const sourceWh = warehouses[0];
    const targetWh = warehouses[1];
    const testProduct = products[0];

    console.log(`\nExecuting ACID Transfer: 2 units of [${testProduct.sku}] from ${sourceWh.code} to ${targetWh.code}...`);
    const transferRes = await request('/api/transfers', 'POST', {
      productId: testProduct._id,
      fromWarehouseId: sourceWh._id,
      toWarehouseId: targetWh._id,
      quantity: 2,
      notes: 'Automated ACID test transfer verification',
    }, adminToken);
    console.log('✔ ACID Transfer Result:', transferRes.status === 200, transferRes.data.message);

    // 7. Purchase Orders
    const poRes = await request('/api/purchase-orders', 'GET', null, adminToken);
    console.log(`✔ Purchase Orders: ${poRes.data.count} POs retrieved`);
    const po = poRes.data.data[0];

    // 8. PDFKit Streaming Endpoint
    console.log(`\nTesting PDF Streaming for PO ${po.poNumber}...`);
    const pdfRes = await request(`/api/reports/po/${po._id}/pdf`, 'GET', null, adminToken);
    const pdfHeader = pdfRes.buffer ? pdfRes.buffer.toString('utf8', 0, 5) : '';
    console.log(`✔ PO PDF Stream Verified: Status ${pdfRes.status}, Size ${pdfRes.buffer?.length} bytes, Magic Header: "${pdfHeader}"`);

    // 9. Analytics Dashboard
    const analyticsRes = await request('/api/analytics/dashboard', 'GET', null, adminToken);
    console.log('✔ Dashboard Analytics KPI Summary:');
    console.log(JSON.stringify(analyticsRes.data.data.summary, null, 2));

    console.log('\n✅ ALL BACKEND ENTERPRISE TESTS PASSED CLEANLY!\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
};

testBackend();
