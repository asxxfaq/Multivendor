// server/scripts/setupVendor.js
// Promotes www.ashfaq088@gmail.com to vendor, creates approved vendor profile,
// and assigns products. Does NOT change the existing password.
import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import bcrypt   from 'bcryptjs'
import User     from '../models/User.js'
import Vendor   from '../models/Vendor.js'
import Product  from '../models/Product.js'
import Category from '../models/Category.js'

const TARGET_EMAIL = 'www.ashfaq088@gmail.com'

const setup = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB connected to:', mongoose.connection.db.databaseName)

    // ── 1. Find the user (already registered) ──────────────────────────────
    let user = await User.findOne({ email: TARGET_EMAIL })
    if (!user) {
      console.log(`❌ User "${TARGET_EMAIL}" NOT found in DB.`)
      console.log('   Make sure you registered on the site first, then re-run this script.')
      process.exit(1)
    }
    console.log(`✅ Found user: ${user.name} (${user.email})`)

    // Promote to vendor role — keep their original password untouched
    await User.findByIdAndUpdate(user._id, {
      role:       'vendor',
      isVerified: true,
      isActive:   true,
    })
    console.log('✅ Role set to vendor, account verified & active')

    // Re-fetch
    user = await User.findById(user._id)

    // ── 2. Find or create Vendor profile ───────────────────────────────────
    let vendor = await Vendor.findOne({ user: user._id })
    if (!vendor) {
      vendor = await Vendor.create({
        user:        user._id,
        storeName:   user.name + "'s Store",
        description: 'Quality products at the best prices',
        isApproved:  true,
        isActive:    true,
        commission:  0.10,
      })
      console.log('✅ Vendor profile created:', vendor.storeName)
    } else {
      // Make sure it's approved and active
      await Vendor.findByIdAndUpdate(vendor._id, { isApproved: true, isActive: true })
      vendor = await Vendor.findById(vendor._id)
      console.log('✅ Vendor profile already exists — ensured approved & active')
    }

    // ── 3. Assign products to this vendor ──────────────────────────────────
    const existingCount = await Product.countDocuments({ vendor: vendor._id })
    if (existingCount > 0) {
      console.log(`✅ Vendor already has ${existingCount} products — skipping product creation`)
    } else {
      // Check if there are any seeded products in DB to reassign
      const allProducts = await Product.find({ isActive: true }).limit(10)
      if (allProducts.length > 0) {
        const ids = allProducts.map(p => p._id)
        await Product.updateMany({ _id: { $in: ids } }, { vendor: vendor._id })
        console.log(`✅ Reassigned ${ids.length} existing products to this vendor`)
      } else {
        // Create fresh products
        const cats = await Category.find({})
        if (cats.length === 0) {
          console.log('⚠️  No categories found — run seedAll.js first, then re-run this script.')
          process.exit(1)
        }
        const C = (name) => (cats.find(c => c.name === name) || cats[0])._id

        const products = await Product.insertMany([
          {
            vendor:       vendor._id,
            name:         'Premium Cotton Slim Fit Shirt',
            description:  'Experience ultimate comfort with our premium cotton slim fit shirt.',
            price:        799, comparePrice: 1299,
            images:       ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80'],
            imageIds:     ['shirt1'], category: C('Shirts'),
            tags:         ['cotton', 'slim-fit', 'formal'], stock: 50,
            ratings:      { average: 4.5, count: 128 }, isActive: true, isFeatured: true,
          },
          {
            vendor:       vendor._id,
            name:         'Casual Graphic T-Shirt',
            description:  'Comfortable cotton graphic t-shirt for everyday casual wear.',
            price:        499, comparePrice: 799,
            images:       ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'],
            imageIds:     ['casual1'], category: C('Casual'),
            tags:         ['tshirt', 'graphic', 'casual'], stock: 80,
            ratings:      { average: 4.1, count: 312 }, isActive: true, isFeatured: false,
          },
          {
            vendor:       vendor._id,
            name:         'Slim Fit Chino Trousers',
            description:  'Modern slim fit chino trousers for casual and semi-formal wear.',
            price:        1299, comparePrice: 1999,
            images:       ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80'],
            imageIds:     ['trouser1'], category: C('Trousers'),
            tags:         ['chino', 'slim-fit'], stock: 40,
            ratings:      { average: 4.2, count: 65 }, isActive: true, isFeatured: false,
          },
          {
            vendor:       vendor._id,
            name:         'Genuine Leather Biker Jacket',
            description:  'Premium genuine leather biker jacket with quilted shoulders.',
            price:        3999, comparePrice: 5999,
            images:       ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80'],
            imageIds:     ['jacket1'], category: C('Jackets'),
            tags:         ['leather', 'biker', 'premium'], stock: 15,
            ratings:      { average: 4.7, count: 203 }, isActive: true, isFeatured: true,
          },
          {
            vendor:       vendor._id,
            name:         'Traditional Kurta Pajama Set',
            description:  'Elegant cotton kurta pajama set for festivals and occasions.',
            price:        1499, comparePrice: 2299,
            images:       ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80'],
            imageIds:     ['ethnic1'], category: C('Ethnic'),
            tags:         ['kurta', 'ethnic', 'festival'], stock: 25,
            ratings:      { average: 4.4, count: 156 }, isActive: true, isFeatured: true,
          },
          {
            vendor:       vendor._id,
            name:         'Oversized Hoodie Sweatshirt',
            description:  'Super comfortable oversized hoodie made from premium cotton fleece.',
            price:        1199, comparePrice: 1799,
            images:       ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80'],
            imageIds:     ['casual2'], category: C('Casual'),
            tags:         ['hoodie', 'oversized', 'cozy'], stock: 55,
            ratings:      { average: 4.5, count: 267 }, isActive: true, isFeatured: true,
          },
          {
            vendor:       vendor._id,
            name:         'Complete 3-Piece Suit Navy Blue',
            description:  'Sophisticated 3-piece navy blue suit from premium wool blend.',
            price:        8999, comparePrice: 13999,
            images:       ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80'],
            imageIds:     ['formal1'], category: C('Formals'),
            tags:         ['suit', '3-piece', 'navy', 'formal'], stock: 12,
            ratings:      { average: 4.8, count: 56 }, isActive: true, isFeatured: true,
          },
          {
            vendor:       vendor._id,
            name:         'Dri-Fit Sports T-Shirt',
            description:  'High-performance dri-fit sports t-shirt with moisture-wicking technology.',
            price:        599, comparePrice: 899,
            images:       ['https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=600&q=80'],
            imageIds:     ['sports1'], category: C('Sports'),
            tags:         ['sports', 'dri-fit', 'gym'], stock: 90,
            ratings:      { average: 4.3, count: 445 }, isActive: true, isFeatured: false,
          },
        ])
        console.log(`✅ Created ${products.length} products for this vendor`)
      }
    }

    // ── 4. Final summary ───────────────────────────────────────────────────
    const productCount = await Product.countDocuments({ vendor: vendor._id, isActive: true })
    user = await User.findById(user._id)

    console.log('')
    console.log('══════════════════════════════════════════════')
    console.log('  VENDOR SETUP COMPLETE!')
    console.log('══════════════════════════════════════════════')
    console.log(`  Email      : ${user.email}`)
    console.log(`  Role       : ${user.role}`)
    console.log(`  Verified   : ${user.isVerified}`)
    console.log(`  Store Name : ${vendor.storeName}`)
    console.log(`  Approved   : ${vendor.isApproved}`)
    console.log(`  Products   : ${productCount}`)
    console.log('══════════════════════════════════════════════')

    process.exit(0)
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

setup()
