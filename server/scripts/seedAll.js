// server/scripts/seedAll.js
import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import bcrypt   from 'bcryptjs'
import User     from '../models/User.js'
import Vendor   from '../models/Vendor.js'
import Product  from '../models/Product.js'
import Category from '../models/Category.js'

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB connected')

    // ── Clean existing data ───────────────────
    await Category.deleteMany({})
    await Product.deleteMany({})
    console.log('🗑️  Cleared categories and products')

    // ── Create Categories ─────────────────────
    const cats = await Category.insertMany([
      { name: 'Shirts',    slug: 'shirts',    isActive: true, order: 1 },
      { name: 'Trousers',  slug: 'trousers',  isActive: true, order: 2 },
      { name: 'Jackets',   slug: 'jackets',   isActive: true, order: 3 },
      { name: 'Ethnic',    slug: 'ethnic',    isActive: true, order: 4 },
      { name: 'Casual',    slug: 'casual',    isActive: true, order: 5 },
      { name: 'Formals',   slug: 'formals',   isActive: true, order: 6 },
      { name: 'Sports',    slug: 'sports',    isActive: true, order: 7 },
      { name: 'Winterwear',slug: 'winterwear',isActive: true, order: 8 },
    ])
    console.log('✅ Categories created:', cats.length)

    const C = (name) => cats.find(c => c.name === name)._id

    // ── Create Vendor User ────────────────────
    let vendorUser = await User.findOne({ email: 'vendor@multishop.com' })
    if (!vendorUser) {
      vendorUser = await User.create({
        name:       'Fashion Hub Store',
        email:      'vendor@multishop.com',
        password:   await bcrypt.hash('Vendor@123', 10),
        role:       'vendor',
        isVerified: true,
        isActive:   true,
      })
      console.log('✅ Vendor user created')
    }

    // ── Create Vendor 2 ───────────────────────
    let vendorUser2 = await User.findOne({ email: 'vendor2@multishop.com' })
    if (!vendorUser2) {
      vendorUser2 = await User.create({
        name:       'Royal Threads',
        email:      'vendor2@multishop.com',
        password:   await bcrypt.hash('Vendor@123', 10),
        role:       'vendor',
        isVerified: true,
        isActive:   true,
      })
      console.log('✅ Vendor user 2 created')
    }

    // ── Create Vendor Profiles ────────────────
    let vendor1 = await Vendor.findOne({ user: vendorUser._id })
    if (!vendor1) {
      vendor1 = await Vendor.create({
        user:        vendorUser._id,
        storeName:   'Fashion Hub',
        description: 'Premium men\'s clothing — shirts, trousers, jackets and more',
        isApproved:  true,
        isActive:    true,
        commission:  0.10,
      })
    }

    let vendor2 = await Vendor.findOne({ user: vendorUser2._id })
    if (!vendor2) {
      vendor2 = await Vendor.create({
        user:        vendorUser2._id,
        storeName:   'Royal Threads',
        description: 'Ethnic wear and traditional Indian clothing for men',
        isApproved:  true,
        isActive:    true,
        commission:  0.10,
      })
    }

    console.log('✅ Vendor profiles ready')

    // ── Create Products ───────────────────────
    const products = await Product.insertMany([

      // ── SHIRTS ──────────────────────────────
      {
        vendor:       vendor1._id,
        name:         'Premium Cotton Slim Fit Shirt',
        description:  'Experience ultimate comfort with our premium cotton slim fit shirt. Crafted from 100% Egyptian cotton, this shirt offers a perfect blend of style and comfort. Ideal for office wear and casual outings.',
        price:        799,
        comparePrice: 1299,
        images:       ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80'],
        imageIds:     ['shirt1'],
        category:     C('Shirts'),
        tags:         ['cotton', 'slim-fit', 'formal', 'office'],
        stock:        50,
        variants:     [
          { size: 'S',  stock: 10 },
          { size: 'M',  stock: 15 },
          { size: 'L',  stock: 15 },
          { size: 'XL', stock: 10 },
        ],
        ratings:    { average: 4.5, count: 128 },
        isActive:   true,
        isFeatured: true,
      },
      {
        vendor:       vendor1._id,
        name:         'Classic White Formal Shirt',
        description:  'A crisp white formal shirt made from premium Egyptian cotton. Features a regular fit with a spread collar, suitable for business meetings and formal events.',
        price:        999,
        comparePrice: 1599,
        images:       ['https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80'],
        imageIds:     ['shirt2'],
        category:     C('Shirts'),
        tags:         ['white', 'formal', 'cotton', 'business'],
        stock:        35,
        variants:     [
          { size: 'S',  stock: 8  },
          { size: 'M',  stock: 10 },
          { size: 'L',  stock: 10 },
          { size: 'XL', stock: 7  },
        ],
        ratings:    { average: 4.3, count: 89 },
        isActive:   true,
        isFeatured: false,
      },
      {
        vendor:       vendor2._id,
        name:         'Casual Check Shirt Full Sleeve',
        description:  'Stylish checkered full sleeve shirt made from soft cotton blend. Perfect for weekends and casual outings with friends and family.',
        price:        649,
        comparePrice: 999,
        images:       ['https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=600&q=80'],
        imageIds:     ['shirt3'],
        category:     C('Shirts'),
        tags:         ['check', 'casual', 'full-sleeve', 'cotton'],
        stock:        60,
        variants:     [
          { size: 'M',  stock: 20 },
          { size: 'L',  stock: 20 },
          { size: 'XL', stock: 20 },
        ],
        ratings:    { average: 4.1, count: 214 },
        isActive:   true,
        isFeatured: true,
      },
      {
        vendor:       vendor1._id,
        name:         'Linen Summer Shirt',
        description:  'Breathable linen summer shirt perfect for hot weather. Features a relaxed fit with button-down collar. Great for beach vacations and outdoor events.',
        price:        849,
        comparePrice: 1199,
        images:       ['https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80'],
        imageIds:     ['shirt4'],
        category:     C('Shirts'),
        tags:         ['linen', 'summer', 'breathable', 'casual'],
        stock:        40,
        ratings:    { average: 4.4, count: 67 },
        isActive:   true,
        isFeatured: false,
      },

      // ── TROUSERS ─────────────────────────────
      {
        vendor:       vendor1._id,
        name:         'Slim Fit Chino Trousers',
        description:  'Modern slim fit chino trousers suitable for both casual and semi-formal occasions. Made from premium cotton blend with a touch of stretch for comfort.',
        price:        1299,
        comparePrice: 1999,
        images:       ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80'],
        imageIds:     ['trouser1'],
        category:     C('Trousers'),
        tags:         ['chino', 'slim-fit', 'casual', 'semi-formal'],
        stock:        40,
        variants:     [
          { size: '30', stock: 10 },
          { size: '32', stock: 12 },
          { size: '34', stock: 10 },
          { size: '36', stock: 8  },
        ],
        ratings:    { average: 4.2, count: 65 },
        isActive:   true,
        isFeatured: false,
      },
      {
        vendor:       vendor1._id,
        name:         'Formal Black Trousers',
        description:  'Premium formal black trousers with straight fit and pressed crease. Made from poly-viscose blend for a sharp professional look. Perfect for office and formal events.',
        price:        1599,
        comparePrice: 2299,
        images:       ['https://images.unsplash.com/photo-1594938298603-c8148c4b4d8d?w=600&q=80'],
        imageIds:     ['trouser2'],
        category:     C('Trousers'),
        tags:         ['formal', 'black', 'straight-fit', 'office'],
        stock:        30,
        variants:     [
          { size: '30', stock: 8  },
          { size: '32', stock: 10 },
          { size: '34', stock: 8  },
          { size: '36', stock: 4  },
        ],
        ratings:    { average: 4.3, count: 94 },
        isActive:   true,
        isFeatured: false,
      },
      {
        vendor:       vendor2._id,
        name:         'Cargo Pants Multi Pocket',
        description:  'Durable cargo pants with multiple pockets for everyday utility. Made from ripstop fabric, ideal for outdoor activities and casual wear.',
        price:        999,
        comparePrice: 1499,
        images:       ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80'],
        imageIds:     ['trouser3'],
        category:     C('Trousers'),
        tags:         ['cargo', 'multi-pocket', 'casual', 'outdoor'],
        stock:        45,
        ratings:    { average: 4.0, count: 178 },
        isActive:   true,
        isFeatured: true,
      },

      // ── JACKETS ──────────────────────────────
      {
        vendor:       vendor1._id,
        name:         'Genuine Leather Biker Jacket',
        description:  'Premium genuine leather biker jacket with quilted shoulders and multiple pockets. Zipper closure with adjustable waist belt. A timeless wardrobe essential.',
        price:        3999,
        comparePrice: 5999,
        images:       ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80'],
        imageIds:     ['jacket1'],
        category:     C('Jackets'),
        tags:         ['leather', 'biker', 'genuine-leather', 'premium'],
        stock:        15,
        variants:     [
          { size: 'S',  stock: 3 },
          { size: 'M',  stock: 5 },
          { size: 'L',  stock: 5 },
          { size: 'XL', stock: 2 },
        ],
        ratings:    { average: 4.7, count: 203 },
        isActive:   true,
        isFeatured: true,
      },
      {
        vendor:       vendor1._id,
        name:         'Classic Denim Jacket',
        description:  'Classic denim jacket with button closure and chest pockets. Made from premium denim fabric. A versatile piece that pairs well with any outfit.',
        price:        1799,
        comparePrice: 2499,
        images:       ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80'],
        imageIds:     ['jacket2'],
        category:     C('Jackets'),
        tags:         ['denim', 'jacket', 'casual', 'classic'],
        stock:        20,
        ratings:    { average: 4.6, count: 178 },
        isActive:   true,
        isFeatured: true,
      },
      {
        vendor:       vendor2._id,
        name:         'Bomber Jacket Olive Green',
        description:  'Trendy bomber jacket in olive green color. Features ribbed cuffs and hem with a zip closure. Perfect for casual outings and evening wear.',
        price:        2199,
        comparePrice: 2999,
        images:       ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80'],
        imageIds:     ['jacket3'],
        category:     C('Jackets'),
        tags:         ['bomber', 'olive', 'casual', 'trendy'],
        stock:        18,
        ratings:    { average: 4.5, count: 112 },
        isActive:   true,
        isFeatured: false,
      },

      // ── ETHNIC ───────────────────────────────
      {
        vendor:       vendor2._id,
        name:         'Traditional Kurta Pajama Set',
        description:  'Elegant cotton kurta pajama set for festivals and special occasions. Features intricate embroidery on the neckline and cuffs. Available in multiple colors.',
        price:        1499,
        comparePrice: 2299,
        images:       ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80'],
        imageIds:     ['ethnic1'],
        category:     C('Ethnic'),
        tags:         ['kurta', 'pajama', 'ethnic', 'festival', 'cotton'],
        stock:        25,
        variants:     [
          { size: 'S',   stock: 5 },
          { size: 'M',   stock: 8 },
          { size: 'L',   stock: 8 },
          { size: 'XL',  stock: 4 },
        ],
        ratings:    { average: 4.4, count: 156 },
        isActive:   true,
        isFeatured: true,
      },
      {
        vendor:       vendor2._id,
        name:         'Sherwani Wedding Collection',
        description:  'Exquisite sherwani from our wedding collection. Made from premium brocade fabric with intricate zari work. Perfect for weddings and grand celebrations.',
        price:        7999,
        comparePrice: 12000,
        images:       ['https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80'],
        imageIds:     ['ethnic2'],
        category:     C('Ethnic'),
        tags:         ['sherwani', 'wedding', 'brocade', 'premium', 'zari'],
        stock:        10,
        ratings:    { average: 4.8, count: 43 },
        isActive:   true,
        isFeatured: true,
      },
      {
        vendor:       vendor2._id,
        name:         'Nehru Jacket Festive Edition',
        description:  'Stylish Nehru jacket perfect for festive occasions. Made from premium silk blend with button closure. Pairs perfectly with kurta or western shirts.',
        price:        1999,
        comparePrice: 2999,
        images:       ['https://images.unsplash.com/photo-1516826957135-700dedea698c?w=600&q=80'],
        imageIds:     ['ethnic3'],
        category:     C('Ethnic'),
        tags:         ['nehru', 'jacket', 'festive', 'silk', 'ethnic'],
        stock:        22,
        ratings:    { average: 4.3, count: 87 },
        isActive:   true,
        isFeatured: false,
      },

      // ── CASUAL ───────────────────────────────
      {
        vendor:       vendor1._id,
        name:         'Casual Graphic T-Shirt',
        description:  'Comfortable cotton graphic t-shirt for everyday casual wear. Features a unique graphic print on the front. Pre-shrunk fabric maintains shape after washing.',
        price:        499,
        comparePrice: 799,
        images:       ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'],
        imageIds:     ['casual1'],
        category:     C('Casual'),
        tags:         ['tshirt', 'graphic', 'casual', 'cotton'],
        stock:        80,
        variants:     [
          { size: 'S',   stock: 20 },
          { size: 'M',   stock: 25 },
          { size: 'L',   stock: 20 },
          { size: 'XL',  stock: 15 },
        ],
        ratings:    { average: 4.1, count: 312 },
        isActive:   true,
        isFeatured: false,
      },
      {
        vendor:       vendor1._id,
        name:         'Oversized Hoodie Sweatshirt',
        description:  'Super comfortable oversized hoodie made from premium cotton fleece. Features a kangaroo pocket and drawstring hood. Perfect for lounging and casual outings.',
        price:        1199,
        comparePrice: 1799,
        images:       ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80'],
        imageIds:     ['casual2'],
        category:     C('Casual'),
        tags:         ['hoodie', 'oversized', 'sweatshirt', 'cozy'],
        stock:        55,
        ratings:    { average: 4.5, count: 267 },
        isActive:   true,
        isFeatured: true,
      },
      {
        vendor:       vendor2._id,
        name:         'Polo T-Shirt Classic Fit',
        description:  'Classic polo t-shirt with ribbed collar and cuffs. Made from premium pique cotton. A wardrobe essential for smart casual occasions.',
        price:        699,
        comparePrice: 999,
        images:       ['https://images.unsplash.com/photo-1625910513578-74b4e4dc6d1e?w=600&q=80'],
        imageIds:     ['casual3'],
        category:     C('Casual'),
        tags:         ['polo', 'classic', 'pique', 'smart-casual'],
        stock:        70,
        ratings:    { average: 4.2, count: 198 },
        isActive:   true,
        isFeatured: false,
      },

      // ── FORMALS ──────────────────────────────
      {
        vendor:       vendor1._id,
        name:         'Complete 3-Piece Suit Navy Blue',
        description:  'Sophisticated 3-piece navy blue suit crafted from premium wool blend. Includes jacket, waistcoat and trousers. Perfect for business meetings and formal events.',
        price:        8999,
        comparePrice: 13999,
        images:       ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80'],
        imageIds:     ['formal1'],
        category:     C('Formals'),
        tags:         ['suit', '3-piece', 'navy', 'wool', 'business'],
        stock:        12,
        ratings:    { average: 4.8, count: 56 },
        isActive:   true,
        isFeatured: true,
      },
      {
        vendor:       vendor2._id,
        name:         'Slim Fit Blazer Charcoal Grey',
        description:  'Sharp slim fit blazer in charcoal grey. Crafted from premium fabric with a two-button closure. Can be paired with trousers or dark jeans.',
        price:        3499,
        comparePrice: 4999,
        images:       ['https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&q=80'],
        imageIds:     ['formal2'],
        category:     C('Formals'),
        tags:         ['blazer', 'slim-fit', 'charcoal', 'formal'],
        stock:        18,
        ratings:    { average: 4.6, count: 134 },
        isActive:   true,
        isFeatured: true,
      },

      // ── SPORTS ───────────────────────────────
      {
        vendor:       vendor1._id,
        name:         'Dri-Fit Sports T-Shirt',
        description:  'High-performance dri-fit sports t-shirt with moisture-wicking technology. Lightweight and breathable fabric keeps you cool during intense workouts.',
        price:        599,
        comparePrice: 899,
        images:       ['https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=600&q=80'],
        imageIds:     ['sports1'],
        category:     C('Sports'),
        tags:         ['sports', 'dri-fit', 'gym', 'workout', 'breathable'],
        stock:        90,
        ratings:    { average: 4.3, count: 445 },
        isActive:   true,
        isFeatured: false,
      },
      {
        vendor:       vendor1._id,
        name:         'Track Pants Slim Fit',
        description:  'Comfortable track pants with slim fit design. Made from polyester blend with elastic waistband. Perfect for gym workouts and outdoor runs.',
        price:        799,
        comparePrice: 1199,
        images:       ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80'],
        imageIds:     ['sports2'],
        category:     C('Sports'),
        tags:         ['track-pants', 'gym', 'sports', 'polyester'],
        stock:        65,
        ratings:    { average: 4.1, count: 289 },
        isActive:   true,
        isFeatured: false,
      },

      // ── WINTERWEAR ───────────────────────────
      {
        vendor:       vendor2._id,
        name:         'Woolen Sweater Cable Knit',
        description:  'Warm and stylish cable knit woolen sweater. Made from premium merino wool blend. Features a crew neck design and ribbed cuffs. Perfect for cold winters.',
        price:        1899,
        comparePrice: 2799,
        images:       ['https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=600&q=80'],
        imageIds:     ['winter1'],
        category:     C('Winterwear'),
        tags:         ['sweater', 'wool', 'cable-knit', 'winter', 'warm'],
        stock:        35,
        ratings:    { average: 4.6, count: 167 },
        isActive:   true,
        isFeatured: true,
      },
      {
        vendor:       vendor1._id,
        name:         'Puffer Jacket Winter Warm',
        description:  'Ultra-warm puffer jacket with premium down filling. Water-resistant outer shell keeps you dry in light rain. Packable design for easy travel.',
        price:        2999,
        comparePrice: 4499,
        images:       ['https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&q=80'],
        imageIds:     ['winter2'],
        category:     C('Winterwear'),
        tags:         ['puffer', 'winter', 'warm', 'down', 'water-resistant'],
        stock:        25,
        ratings:    { average: 4.7, count: 223 },
        isActive:   true,
        isFeatured: true,
      },
    ])

    console.log('✅ Products created:', products.length)
    console.log('')
    console.log('══════════════════════════════════════')
    console.log('  SEED COMPLETE!')
    console.log('══════════════════════════════════════')
    console.log('')
    console.log('  Categories : 8')
    console.log('  Products   :', products.length)
    console.log('')
    console.log('  Vendor 1 login:')
    console.log('  Email    : vendor@multishop.com')
    console.log('  Password : Vendor@123')
    console.log('')
    console.log('  Vendor 2 login:')
    console.log('  Email    : vendor2@multishop.com')
    console.log('  Password : Vendor@123')
    console.log('')
    console.log('  Visit : http://localhost:5173/shop')
    console.log('══════════════════════════════════════')

    process.exit(0)

  } catch (err) {
    console.error('❌ Seed error:', err.message)
    process.exit(1)
  }
}

seed()