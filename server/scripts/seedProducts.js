// server/scripts/seedAshfaqProducts.js
import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import User     from '../models/User.js'
import Vendor   from '../models/Vendor.js'
import Product  from '../models/Product.js'
import Category from '../models/Category.js'

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB connected')

    // ── Find Ashfaq vendor ────────────────────
    const user = await User.findOne({ email: 'www.ashfaq0881@gmail.com' })
    if (!user) {
      console.error('❌ Vendor user not found. Run createVendor.js first.')
      process.exit(1)
    }

    const vendor = await Vendor.findOne({ user: user._id })
    if (!vendor) {
      console.error('❌ Vendor profile not found. Run createVendor.js first.')
      process.exit(1)
    }
    console.log('✅ Found vendor:', vendor.storeName)

    // ── Get categories ────────────────────────
    const cats = await Category.find({})
    if (cats.length === 0) {
      console.error('❌ No categories found. Run seedAll.js first.')
      process.exit(1)
    }

    const C = (name) => {
      const cat = cats.find(c => c.name === name)
      if (!cat) {
        console.warn(`⚠️  Category "${name}" not found, using first category`)
        return cats[0]._id
      }
      return cat._id
    }

    // ── Delete old products by this vendor ────
    const deleted = await Product.deleteMany({ vendor: vendor._id })
    console.log(`🗑️  Removed ${deleted.deletedCount} old products`)

    // ── Create products ───────────────────────
    const products = await Product.insertMany([

      // ── SHIRTS ──────────────────────────────
      {
        vendor:       vendor._id,
        name:         'Oxford Weave Cotton Shirt',
        description:  'Premium Oxford weave shirt made from 100% combed cotton for superior softness and durability. Features a button-down collar and classic fit that works perfectly for both office and casual settings.',
        price:        849,
        comparePrice: 1399,
        images:       ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80'],
        imageIds:     ['ashfaq_shirt1'],
        category:     C('Shirts'),
        tags:         ['oxford', 'cotton', 'premium', 'formal'],
        stock:        45,
        variants:     [
          { size: 'S',  stock: 10 },
          { size: 'M',  stock: 15 },
          { size: 'L',  stock: 12 },
          { size: 'XL', stock: 8  },
        ],
        ratings:    { average: 4.6, count: 89 },
        isActive:   true,
        isFeatured: true,
      },
      {
        vendor:       vendor._id,
        name:         'Abstract Print Half Sleeve Shirt',
        description:  'Trendy printed half sleeve shirt in soft cotton blend fabric with a unique abstract print. Perfect for weekend outings and casual get-togethers.',
        price:        599,
        comparePrice: 899,
        images:       ['https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=600&q=80'],
        imageIds:     ['ashfaq_shirt2'],
        category:     C('Shirts'),
        tags:         ['printed', 'half-sleeve', 'casual', 'cotton'],
        stock:        60,
        variants:     [
          { size: 'S',  stock: 15 },
          { size: 'M',  stock: 20 },
          { size: 'L',  stock: 15 },
          { size: 'XL', stock: 10 },
        ],
        ratings:    { average: 4.2, count: 134 },
        isActive:   true,
        isFeatured: true,
      },
      {
        vendor:       vendor._id,
        name:         'Mandarin Collar Linen Shirt',
        description:  'Stylish mandarin collar shirt with a modern silhouette. Made from premium linen blend fabric. A sophisticated choice for evening dinners and special occasions.',
        price:        999,
        comparePrice: 1499,
        images:       ['https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=600&q=80'],
        imageIds:     ['ashfaq_shirt3'],
        category:     C('Shirts'),
        tags:         ['mandarin', 'linen', 'evening', 'premium'],
        stock:        30,
        ratings:    { average: 4.4, count: 67 },
        isActive:   true,
        isFeatured: false,
      },
      {
        vendor:       vendor._id,
        name:         'Washed Denim Full Sleeve Shirt',
        description:  'Classic denim shirt featuring a western-style yoke and chest pockets. Made from washed denim fabric for a relaxed lived-in look. Pairs perfectly with chinos or jeans.',
        price:        1099,
        comparePrice: 1699,
        images:       ['https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80'],
        imageIds:     ['ashfaq_shirt4'],
        category:     C('Shirts'),
        tags:         ['denim', 'full-sleeve', 'western', 'casual'],
        stock:        35,
        ratings:    { average: 4.3, count: 98 },
        isActive:   true,
        isFeatured: false,
      },
      {
        vendor:       vendor._id,
        name:         'Slim Fit Solid Formal Shirt',
        description:  'Clean and professional slim fit formal shirt in solid colour. Made from wrinkle-resistant fabric. Ideal for long working hours without losing its crisp look.',
        price:        749,
        comparePrice: 1199,
        images:       ['https://images.unsplash.com/photo-1541346183200-e8e117d945b2?w=600&q=80'],
        imageIds:     ['ashfaq_shirt5'],
        category:     C('Shirts'),
        tags:         ['slim-fit', 'formal', 'solid', 'wrinkle-resistant'],
        stock:        50,
        ratings:    { average: 4.5, count: 203 },
        isActive:   true,
        isFeatured: true,
      },

      // ── TROUSERS ─────────────────────────────
      {
        vendor:       vendor._id,
        name:         'Slim Fit Formal Trousers',
        description:  'Premium slim fit formal trousers made from fine poly-viscose blend for a sharp professional look. Features a mid-rise waist with a flat front for a clean silhouette.',
        price:        1299,
        comparePrice: 1999,
        images:       ['https://images.unsplash.com/photo-1594938298603-c8148c4b4d8d?w=600&q=80'],
        imageIds:     ['ashfaq_trouser1'],
        category:     C('Trousers'),
        tags:         ['slim-fit', 'formal', 'poly-viscose', 'office'],
        stock:        40,
        variants:     [
          { size: '30', stock: 10 },
          { size: '32', stock: 12 },
          { size: '34', stock: 10 },
          { size: '36', stock: 8  },
        ],
        ratings:    { average: 4.4, count: 112 },
        isActive:   true,
        isFeatured: false,
      },
      {
        vendor:       vendor._id,
        name:         'Stretch Chino Trousers',
        description:  'Comfortable stretch chino trousers with a modern slim fit. Made from cotton blend with added elastane for ease of movement. Suitable for both casual and smart casual wear.',
        price:        1099,
        comparePrice: 1699,
        images:       ['https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80'],
        imageIds:     ['ashfaq_trouser2'],
        category:     C('Trousers'),
        tags:         ['chino', 'stretch', 'slim-fit', 'smart-casual'],
        stock:        45,
        ratings:    { average: 4.2, count: 87 },
        isActive:   true,
        isFeatured: true,
      },
      {
        vendor:       vendor._id,
        name:         'Regular Fit Jogger Pants',
        description:  'Relaxed regular fit jogger pants made from soft cotton terry. Features an elastic waistband with a drawstring and ribbed cuffs. Perfect for lounging and casual outings.',
        price:        799,
        comparePrice: 1199,
        images:       ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80'],
        imageIds:     ['ashfaq_trouser3'],
        category:     C('Trousers'),
        tags:         ['jogger', 'regular-fit', 'casual', 'cotton'],
        stock:        55,
        ratings:    { average: 4.0, count: 156 },
        isActive:   true,
        isFeatured: false,
      },

      // ── JACKETS ──────────────────────────────
      {
        vendor:       vendor._id,
        name:         'Quilted Puffer Jacket',
        description:  'Lightweight quilted puffer jacket with premium polyester fill. Water-resistant outer shell with a zip closure and two side pockets. Provides warmth without the bulk.',
        price:        2499,
        comparePrice: 3799,
        images:       ['https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&q=80'],
        imageIds:     ['ashfaq_jacket1'],
        category:     C('Jackets'),
        tags:         ['puffer', 'quilted', 'winter', 'water-resistant'],
        stock:        20,
        variants:     [
          { size: 'S',  stock: 4 },
          { size: 'M',  stock: 7 },
          { size: 'L',  stock: 6 },
          { size: 'XL', stock: 3 },
        ],
        ratings:    { average: 4.5, count: 143 },
        isActive:   true,
        isFeatured: true,
      },
      {
        vendor:       vendor._id,
        name:         'Zip-Up Track Jacket',
        description:  'Sporty zip-up track jacket made from moisture-wicking polyester. Features contrast side stripes and a stand-up collar. Great for gym sessions and casual outdoor activities.',
        price:        1299,
        comparePrice: 1899,
        images:       ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80'],
        imageIds:     ['ashfaq_jacket2'],
        category:     C('Jackets'),
        tags:         ['track', 'zip-up', 'sports', 'polyester'],
        stock:        30,
        ratings:    { average: 4.3, count: 76 },
        isActive:   true,
        isFeatured: false,
      },

      // ── ETHNIC ───────────────────────────────
      {
        vendor:       vendor._id,
        name:         'Cotton Kurta Pajama Set',
        description:  'Elegant cotton kurta pajama set perfect for festivals and casual occasions. Features fine thread embroidery on the neckline. Breathable and comfortable for all day wear.',
        price:        1299,
        comparePrice: 1999,
        images:       ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80'],
        imageIds:     ['ashfaq_ethnic1'],
        category:     C('Ethnic'),
        tags:         ['kurta', 'pajama', 'cotton', 'festival', 'ethnic'],
        stock:        30,
        variants:     [
          { size: 'S',  stock: 6  },
          { size: 'M',  stock: 10 },
          { size: 'L',  stock: 10 },
          { size: 'XL', stock: 4  },
        ],
        ratings:    { average: 4.5, count: 189 },
        isActive:   true,
        isFeatured: true,
      },
      {
        vendor:       vendor._id,
        name:         'Embroidered Pathani Suit',
        description:  'Traditional Pathani suit with fine embroidery work on the collar and cuffs. Made from premium cotton fabric. A comfortable and stylish choice for casual and festive occasions.',
        price:        1799,
        comparePrice: 2699,
        images:       ['https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80'],
        imageIds:     ['ashfaq_ethnic2'],
        category:     C('Ethnic'),
        tags:         ['pathani', 'embroidered', 'cotton', 'traditional'],
        stock:        20,
        ratings:    { average: 4.6, count: 112 },
        isActive:   true,
        isFeatured: true,
      },
      {
        vendor:       vendor._id,
        name:         'Silk Blend Nehru Jacket',
        description:  'Sophisticated Nehru jacket crafted from premium silk blend fabric. Features a classic mandarin collar with button closure. Perfect for festive occasions and formal gatherings.',
        price:        1599,
        comparePrice: 2499,
        images:       ['https://images.unsplash.com/photo-1516826957135-700dedea698c?w=600&q=80'],
        imageIds:     ['ashfaq_ethnic3'],
        category:     C('Ethnic'),
        tags:         ['nehru', 'silk', 'festive', 'mandarin', 'ethnic'],
        stock:        18,
        ratings:    { average: 4.4, count: 78 },
        isActive:   true,
        isFeatured: false,
      },

      // ── CASUAL ───────────────────────────────
      {
        vendor:       vendor._id,
        name:         'Round Neck Graphic T-Shirt',
        description:  'Comfortable round neck graphic t-shirt made from 100% pre-shrunk cotton. Features a bold graphic print on the chest. Maintains its shape and colour after multiple washes.',
        price:        449,
        comparePrice: 699,
        images:       ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'],
        imageIds:     ['ashfaq_casual1'],
        category:     C('Casual'),
        tags:         ['tshirt', 'graphic', 'round-neck', 'cotton'],
        stock:        100,
        variants:     [
          { size: 'S',   stock: 25 },
          { size: 'M',   stock: 30 },
          { size: 'L',   stock: 25 },
          { size: 'XL',  stock: 20 },
        ],
        ratings:    { average: 4.1, count: 445 },
        isActive:   true,
        isFeatured: false,
      },
      {
        vendor:       vendor._id,
        name:         'Fleece Zip Hoodie',
        description:  'Warm and cozy full-zip hoodie made from premium cotton fleece. Features a front zip closure with a kangaroo pocket and adjustable hood. Perfect for cool evenings.',
        price:        1299,
        comparePrice: 1999,
        images:       ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80'],
        imageIds:     ['ashfaq_casual2'],
        category:     C('Casual'),
        tags:         ['hoodie', 'fleece', 'zip', 'warm', 'casual'],
        stock:        40,
        ratings:    { average: 4.5, count: 234 },
        isActive:   true,
        isFeatured: true,
      },
      {
        vendor:       vendor._id,
        name:         'Classic Polo T-Shirt',
        description:  'Timeless classic polo t-shirt made from premium pique cotton. Features a ribbed collar with two-button placket. A wardrobe essential for smart casual occasions.',
        price:        649,
        comparePrice: 999,
        images:       ['https://images.unsplash.com/photo-1625910513578-74b4e4dc6d1e?w=600&q=80'],
        imageIds:     ['ashfaq_casual3'],
        category:     C('Casual'),
        tags:         ['polo', 'pique', 'classic', 'smart-casual'],
        stock:        75,
        ratings:    { average: 4.3, count: 312 },
        isActive:   true,
        isFeatured: false,
      },

      // ── FORMALS ──────────────────────────────
      {
        vendor:       vendor._id,
        name:         'Two Piece Suit Navy Blue',
        description:  'Sharp two-piece suit in classic navy blue. Crafted from premium wool blend fabric with a fully lined jacket. Features a two-button closure and notch lapels. Perfect for business and formal events.',
        price:        6999,
        comparePrice: 9999,
        images:       ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80'],
        imageIds:     ['ashfaq_formal1'],
        category:     C('Formals'),
        tags:         ['suit', '2-piece', 'navy', 'wool', 'formal'],
        stock:        15,
        ratings:    { average: 4.7, count: 67 },
        isActive:   true,
        isFeatured: true,
      },
      {
        vendor:       vendor._id,
        name:         'Single Breasted Blazer',
        description:  'Classic single breasted blazer in charcoal grey. Made from premium fabric with a slim fit silhouette. Features a two-button closure with a notch lapel. Pairs well with both formal trousers and dark jeans.',
        price:        3299,
        comparePrice: 4799,
        images:       ['https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&q=80'],
        imageIds:     ['ashfaq_formal2'],
        category:     C('Formals'),
        tags:         ['blazer', 'single-breasted', 'charcoal', 'slim-fit'],
        stock:        20,
        ratings:    { average: 4.5, count: 98 },
        isActive:   true,
        isFeatured: true,
      },

      // ── SPORTS ───────────────────────────────
      {
        vendor:       vendor._id,
        name:         'Compression Training T-Shirt',
        description:  'High-performance compression t-shirt with moisture-wicking and quick-dry technology. Ergonomic fit reduces muscle fatigue during intense workouts. Flatlock seams prevent chafing.',
        price:        699,
        comparePrice: 1099,
        images:       ['https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=600&q=80'],
        imageIds:     ['ashfaq_sports1'],
        category:     C('Sports'),
        tags:         ['compression', 'gym', 'training', 'moisture-wicking'],
        stock:        80,
        ratings:    { average: 4.4, count: 378 },
        isActive:   true,
        isFeatured: false,
      },
      {
        vendor:       vendor._id,
        name:         'Running Track Pants',
        description:  'Lightweight running track pants made from breathable polyester. Features an elastic waistband with drawstring and zip pockets. Reflective details for low-light visibility.',
        price:        899,
        comparePrice: 1299,
        images:       ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80'],
        imageIds:     ['ashfaq_sports2'],
        category:     C('Sports'),
        tags:         ['running', 'track-pants', 'polyester', 'reflective'],
        stock:        60,
        ratings:    { average: 4.2, count: 267 },
        isActive:   true,
        isFeatured: false,
      },

      // ── WINTERWEAR ───────────────────────────
      {
        vendor:       vendor._id,
        name:         'Merino Wool Crew Neck Sweater',
        description:  'Premium merino wool crew neck sweater offering exceptional warmth and softness. Fine knit construction with ribbed cuffs and hem. Versatile enough to wear over a shirt or under a jacket.',
        price:        2199,
        comparePrice: 3299,
        images:       ['https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?w=600&q=80'],
        imageIds:     ['ashfaq_winter1'],
        category:     C('Winterwear'),
        tags:         ['merino', 'wool', 'sweater', 'crew-neck', 'winter'],
        stock:        30,
        variants:     [
          { size: 'S',  stock: 6  },
          { size: 'M',  stock: 10 },
          { size: 'L',  stock: 10 },
          { size: 'XL', stock: 4  },
        ],
        ratings:    { average: 4.7, count: 189 },
        isActive:   true,
        isFeatured: true,
      },
      {
        vendor:       vendor._id,
        name:         'Thermal Base Layer Set',
        description:  'Warm thermal base layer set consisting of a long sleeve top and full length bottoms. Made from soft brushed fabric that traps heat efficiently. Essential for extremely cold weather.',
        price:        1499,
        comparePrice: 2199,
        images:       ['https://images.unsplash.com/photo-1588117305388-c2631a279f82?w=600&q=80'],
        imageIds:     ['ashfaq_winter2'],
        category:     C('Winterwear'),
        tags:         ['thermal', 'base-layer', 'winter', 'warm', 'set'],
        stock:        35,
        ratings:    { average: 4.5, count: 134 },
        isActive:   true,
        isFeatured: false,
      },
    ])

    console.log('✅ Products created:', products.length)
    console.log('')
    console.log('══════════════════════════════════════')
    console.log('  SEED COMPLETE!')
    console.log('══════════════════════════════════════')
    console.log('')
    console.log('  Vendor  : Ashfaq Store')
    console.log('  Products:', products.length)
    console.log('')
    console.log('  Breakdown:')
    console.log('  Shirts     : 5')
    console.log('  Trousers   : 3')
    console.log('  Jackets    : 2')
    console.log('  Ethnic     : 3')
    console.log('  Casual     : 3')
    console.log('  Formals    : 2')
    console.log('  Sports     : 2')
    console.log('  Winterwear : 2')
    console.log('')
    console.log('  Visit: http://localhost:5173/shop')
    console.log('══════════════════════════════════════')

    process.exit(0)

  } catch (err) {
    console.error('❌ Seed error:', err.message)
    process.exit(1)
  }
}

seed()