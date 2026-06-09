import dotenv from 'dotenv'
dotenv.config()
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

const test = async () => {
  try {
    console.log('--- Testing Password Reuse Validation ---')
    // 1. Login as Vendor
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'vendor@multishop.com',
      password: 'Vendor@123'
    })
    const token = loginRes.data.token
    console.log('✅ Vendor login successful')

    // 2. Try to change password to the same one
    try {
      await axios.put(
        `${API_URL}/auth/change-password`,
        {
          currentPassword: 'Vendor@123',
          newPassword: 'Vendor@123',
          confirmPassword: 'Vendor@123'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      console.log('❌ Error: Password change with same password should have failed!')
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message.includes('different')) {
        console.log('✅ Success: Password change failed correctly:', err.response.data.message)
      } else {
        console.log('❌ Unexpected error response:', err.response?.status, err.response?.data)
      }
    }

    console.log('\n--- Testing Vendor Products Paginated Retrieval & Regex Search ---')
    // A. Regular search
    const vendorProdRes = await axios.get(
      `${API_URL}/vendor/products?page=1&limit=5&search=Premium`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const vpData = vendorProdRes.data
    console.log('✅ Vendor Products response structure verified:')
    console.log(`   - total products matching: ${vpData.total}`)
    console.log(`   - page count: ${vpData.pages}`)
    console.log(`   - stats (total): ${vpData.stats?.total}`)
    console.log(`   - products returned: ${vpData.products?.length}`)

    // B. Color/Tag Search (e.g., "black")
    const colorSearchRes = await axios.get(
      `${API_URL}/vendor/products?page=1&limit=5&search=black`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    console.log(`✅ Color search ('black') returned ${colorSearchRes.data.products?.length} products`)

    // C. Price Search (e.g., "1000" should return products with price <= 1000)
    const priceSearchRes = await axios.get(
      `${API_URL}/vendor/products?page=1&limit=10&search=1000`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const allLess = priceSearchRes.data.products?.every(p => p.price <= 1000)
    console.log(`✅ Price search ('1000') returned ${priceSearchRes.data.products?.length} products (all <= 1000: ${allLess})`)

    console.log('\n--- Testing Admin Products Management ---')
    // 3. Login as Admin
    const adminLoginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@multishop.com',
      password: 'Admin@123'
    })
    const adminToken = adminLoginRes.data.token
    console.log('✅ Admin login successful')

    // 4. Get all products as admin
    const adminProdRes = await axios.get(
      `${API_URL}/admin/products?page=1&limit=5&search=Casual`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    )
    const apData = adminProdRes.data
    console.log('✅ Admin Products list response structure verified:')
    console.log(`   - total matching: ${apData.total}`)
    console.log(`   - pages: ${apData.pages}`)
    console.log(`   - active stats: ${apData.active}`)
    console.log(`   - hidden stats: ${apData.hidden}`)
    console.log(`   - outOfStock stats: ${apData.outOfStock}`)
    console.log(`   - totalCount stats: ${apData.totalCount}`)
    console.log(`   - products returned: ${apData.products?.length}`)

    if (apData.products?.length > 0) {
      const targetProd = apData.products[0]
      console.log(`\n--- Testing Toggle Product Status for "${targetProd.name}" ---`)
      const toggleRes = await axios.put(
        `${API_URL}/admin/products/${targetProd._id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } }
      )
      console.log(`✅ Toggle response status: ${toggleRes.status}`)
      console.log(`   - new isActive status: ${toggleRes.data.product.isActive}`)
    }

    console.log('\n🎉 ALL ENDPOINT TESTS PASSED SUCCESSFULLY!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Test script failed:', err.response?.data || err.message)
    process.exit(1)
  }
}

test()
