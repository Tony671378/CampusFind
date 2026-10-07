import type { Database } from 'better-sqlite3';
import bcrypt from 'bcryptjs';

export function seedDatabase(db: Database) {
  const passwordHash = bcrypt.hashSync('college123', 10);

  // 1. Settings
  const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  insertSetting.run('allowed_email_domain', '@college.edu');
  insertSetting.run('safe_handover_location', 'Campus Security Office (Main Gatehouse) or Library Front Desk');
  insertSetting.run('campus_name', 'Metropolitan Institute of Technology');

  // 2. Categories
  const categories = [
    { id: 1, name: 'Electronics', icon: 'Laptop', slug: 'electronics', description: 'Phones, laptops, earbuds, chargers, headphones' },
    { id: 2, name: 'Documents & IDs', icon: 'FileText', slug: 'documents-ids', description: 'Student IDs, driver licenses, project folders' },
    { id: 3, name: 'Bags & Backpacks', icon: 'Briefcase', slug: 'bags-backpacks', description: 'Backpacks, laptop sleeves, tote bags, duffels' },
    { id: 4, name: 'Books & Stationery', icon: 'BookOpen', slug: 'books-stationery', description: 'Calculators, textbooks, notebooks, pencil cases' },
    { id: 5, name: 'Accessories & Watches', icon: 'Watch', slug: 'accessories', description: 'Smartwatches, rings, bracelets, prescription glasses' },
    { id: 6, name: 'Wallets & Purses', icon: 'CreditCard', slug: 'wallets', description: 'Wallets, cardholders, coin pouches' },
    { id: 7, name: 'Keys & Keychains', icon: 'Key', slug: 'keys', description: 'Room keys, vehicle keys, lanyard keys' },
    { id: 8, name: 'Clothing & Apparel', icon: 'Shirt', slug: 'clothing', description: 'Jackets, hoodies, college jerseys, caps, scarves' },
    { id: 9, name: 'Lab Equipment', icon: 'FlaskConical', slug: 'lab-equipment', description: 'Lab coats, safety goggles, multimeters, breadboards' },
    { id: 10, name: 'Water Bottles & Flasks', icon: 'Coffee', slug: 'bottles-flasks', description: 'Hydroflasks, insulated tumblers, metal shaker cups' },
  ];

  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (id, name, icon, slug, description) VALUES (?, ?, ?, ?, ?)');
  for (const c of categories) {
    insertCategory.run(c.id, c.name, c.icon, c.slug, c.description);
  }

  // 3. Locations
  const locations = [
    { id: 1, name: 'Main Gate & Security Post', building: 'Gatehouse', zone: 'Entrance', x: 15, y: 82, description: 'Campus entrance security checkpoint and drop box' },
    { id: 2, name: 'Central Library', building: 'Library Tower', zone: 'Academic', x: 48, y: 36, description: '3-floor library, reading halls and reference desk' },
    { id: 3, name: 'Computer Science Lab', building: 'Turing Block Level 2', zone: 'Academic', x: 32, y: 44, description: 'Advanced computing labs 201 to 208' },
    { id: 4, name: 'Electronics Lab', building: 'Tesla Hall Ground Fl', zone: 'Engineering', x: 26, y: 56, description: 'Circuits, breadboard testing & hardware benches' },
    { id: 5, name: 'Mechanical Workshop', building: 'Edison Workshop', zone: 'Engineering', x: 20, y: 68, description: 'Machine shop, manufacturing bays and tool shed' },
    { id: 6, name: 'Campus Canteen & Food Court', building: 'Student Center Hub', zone: 'Recreation', x: 62, y: 60, description: 'Cafeteria seating, coffee kiosks and central plaza' },
    { id: 7, name: 'Main Auditorium', building: 'Tagore Memorial Hall', zone: 'Cultural', x: 74, y: 44, description: 'Grand auditorium stage, balcony, lobby reception' },
    { id: 8, name: 'North Parking Lot', building: 'Open Parking Bay B', zone: 'Transport', x: 86, y: 76, description: 'Two-wheeler and car parking area with shade sheds' },
    { id: 9, name: 'Sports Complex & Arena', building: 'Olympic Gymnasium', zone: 'Sports', x: 78, y: 18, description: 'Indoor badminton, basketball court & athletics track' },
    { id: 10, name: 'Student Hostels Quad', building: 'Residential Block A&B', zone: 'Residential', x: 16, y: 22, description: 'Dormitory courtyards, laundry rooms & common lounge' },
    { id: 11, name: 'Classroom Block Alpha', building: 'Lecture Hall A-301', zone: 'Academic', x: 38, y: 22, description: 'Multi-tiered lecture halls and seminar rooms' },
    { id: 12, name: 'Administrative Center', building: 'Main Admin Center', zone: 'Administration', x: 56, y: 24, description: 'Registrar office, Dean desk, accounts division' },
  ];

  const insertLocation = db.prepare('INSERT OR IGNORE INTO locations (id, name, building, zone, map_x, map_y, description) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const l of locations) {
    insertLocation.run(l.id, l.name, l.building, l.zone, l.x, l.y, l.description);
  }

  // 4. Users (10 users)
  const users = [
    { id: 1, name: 'Alex Rivera', email: 'alex.rivera@college.edu', college_id: 'CS-2023-042', department: 'Computer Science', year: '3rd Year', role: 'student', profile_image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80', is_flagged: 0, false_claims_count: 0 },
    { id: 2, name: 'Priya Sharma', email: 'priya.sharma@college.edu', college_id: 'EC-2024-118', department: 'Electronics & Comm', year: '2nd Year', role: 'student', profile_image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', is_flagged: 0, false_claims_count: 0 },
    { id: 3, name: 'Marcus Chen', email: 'marcus.chen@college.edu', college_id: 'ME-2022-089', department: 'Mechanical Engineering', year: '4th Year', role: 'student', profile_image: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80', is_flagged: 0, false_claims_count: 0 },
    { id: 4, name: 'Emily Watson', email: 'emily.watson@college.edu', college_id: 'IS-2025-014', department: 'Information Science', year: '1st Year', role: 'student', profile_image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80', is_flagged: 0, false_claims_count: 0 },
    { id: 5, name: 'Rohan Patel', email: 'rohan.patel@college.edu', college_id: 'EE-2023-076', department: 'Electrical Engineering', year: '3rd Year', role: 'student', profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', is_flagged: 0, false_claims_count: 0 },
    { id: 6, name: 'Sarah Jenkins', email: 'sarah.jenkins@college.edu', college_id: 'AR-2024-033', department: 'Architecture & Design', year: '2nd Year', role: 'student', profile_image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', is_flagged: 0, false_claims_count: 0 },
    { id: 7, name: 'David Kim', email: 'david.kim@college.edu', college_id: 'BT-2022-105', department: 'Biotechnology', year: '4th Year', role: 'student', profile_image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', is_flagged: 0, false_claims_count: 0 },
    { id: 8, name: 'Officer James Hall', email: 'security.hall@college.edu', college_id: 'STAFF-SEC-09', department: 'Campus Security & Safety', year: 'Faculty/Staff', role: 'staff', profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', is_flagged: 0, false_claims_count: 0 },
    { id: 9, name: 'Dr. Linda Vance', email: 'linda.vance@college.edu', college_id: 'STAFF-LIB-02', department: 'Library & Student Affairs', year: 'Faculty/Staff', role: 'staff', profile_image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80', is_flagged: 0, false_claims_count: 0 },
    { id: 10, name: 'Dean Arthur Miller', email: 'admin.miller@college.edu', college_id: 'ADMIN-DIR-01', department: 'Campus Operations & Dean', year: 'Administration', role: 'admin', profile_image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80', is_flagged: 0, false_claims_count: 0 },
  ];

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, password_hash, college_id, department, year, role, profile_image, is_flagged, false_claims_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const u of users) {
    insertUser.run(u.id, u.name, u.email, passwordHash, u.college_id, u.department, u.year, u.role, u.profile_image, u.is_flagged, u.false_claims_count);
  }

  // 5. Items (15 Lost, 15 Found)
  // Notice intentional high-matching pairs for smart matching & claim verification:
  const items = [
    // --- LOST ITEMS (15 items) ---
    {
      id: 1,
      user_id: 1, // Alex Rivera
      type: 'lost',
      title: 'Black JBL Tune 230NC Wireless Earbuds',
      category_id: 1, // Electronics
      description: 'Lost my black JBL earbuds inside their matte black charging case. Last seen near Computer Lab 204 desk 12 on Monday afternoon.',
      brand: 'JBL',
      color: 'Black',
      model: 'Tune 230NC TWS',
      location_id: 3, // Computer Science Lab
      date: '2026-10-05',
      approximate_time: '14:30',
      image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
      status: 'possible_match',
      private_details: 'Has a tiny scratch on the bottom edge and left bud has a medium silicone tip.',
      reward: '$20 Cafeteria voucher for finder!',
      storage_location: null,
      views_count: 48,
    },
    {
      id: 2,
      user_id: 2, // Priya Sharma
      type: 'lost',
      title: 'Casio fx-991EX ClassWiz Scientific Calculator',
      category_id: 4, // Books & Stationery
      description: 'Misplaced my black and white Casio engineering calculator right after the circuit design test in Electronics Lab.',
      brand: 'Casio',
      color: 'Black/White',
      model: 'fx-991EX',
      location_id: 4, // Electronics Lab
      date: '2026-10-06',
      approximate_time: '11:15',
      image_url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
      status: 'possible_match',
      private_details: 'There is a small yellow cartoon sticker pasted on the inside of the protective sliding cover.',
      reward: 'Free iced coffee treat',
      storage_location: null,
      views_count: 32,
    },
    {
      id: 3,
      user_id: 3, // Marcus Chen
      type: 'lost',
      title: 'Cobalt Blue Hydro Flask 32oz Wide Mouth',
      category_id: 10, // Water Bottles & Flasks
      description: 'Lost my cobalt blue insulated Hydro Flask water bottle on the bleachers near the basketball court during evening practice.',
      brand: 'Hydro Flask',
      color: 'Blue',
      model: '32 oz Wide Mouth',
      location_id: 9, // Sports Complex
      date: '2026-10-04',
      approximate_time: '17:45',
      image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
      status: 'possible_match',
      private_details: 'Slightly dented bottom rim and a reflective mountain peak sticker on side.',
      reward: null,
      storage_location: null,
      views_count: 19,
    },
    {
      id: 4,
      user_id: 4, // Emily Watson
      type: 'lost',
      title: 'Fossil Brown Leather Bi-fold Wallet',
      category_id: 6, // Wallets & Purses
      description: 'Dropped my vintage brown leather Fossil wallet around table 14 in the Campus Canteen while having lunch.',
      brand: 'Fossil',
      color: 'Brown',
      model: 'Derrick Bi-Fold',
      location_id: 6, // Campus Canteen
      date: '2026-10-06',
      approximate_time: '13:00',
      image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
      status: 'claim_pending',
      private_details: 'Contains campus library card ending in 014, two subway transit tokens, and a mini Polaroid photo.',
      reward: '$15 cash reward',
      storage_location: null,
      views_count: 76,
    },
    {
      id: 5,
      user_id: 5, // Rohan Patel
      type: 'lost',
      title: 'College Student ID Card with Blue Lanyard',
      category_id: 2, // Documents & IDs
      description: 'Official university smart ID card with blue MIT lanyard. Misplaced near the 2nd floor quiet reading section.',
      brand: 'Metropolitan Institute',
      color: 'Blue/White',
      model: 'RFID Smart Badge',
      location_id: 2, // Central Library
      date: '2026-10-05',
      approximate_time: '16:00',
      image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
      status: 'possible_match',
      private_details: 'ID Number: EE-2023-076 with a library barcode sticker on back.',
      reward: null,
      storage_location: null,
      views_count: 41,
    },
    {
      id: 6,
      user_id: 6, // Sarah Jenkins
      type: 'lost',
      title: 'The North Face Borealis Black Backpack',
      category_id: 3, // Bags & Backpacks
      description: 'Left my black North Face backpack containing architectural sketchbooks in Lecture Hall A-301 after the history lecture.',
      brand: 'The North Face',
      color: 'Black',
      model: 'Borealis 28L',
      location_id: 11, // Classroom Block Alpha
      date: '2026-10-05',
      approximate_time: '15:20',
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
      status: 'lost',
      private_details: 'Inside front zipper has 3 Staedtler drawing pencils and an orange eraser.',
      reward: '$30 reward',
      storage_location: null,
      views_count: 55,
    },
    {
      id: 7,
      user_id: 7, // David Kim
      type: 'lost',
      title: 'Apple Pencil (2nd Generation)',
      category_id: 1, // Electronics
      description: 'Magnetic Apple stylus detached from my iPad Pro while studying in Central Library 1st floor cafe area.',
      brand: 'Apple',
      color: 'White',
      model: 'Apple Pencil 2nd Gen',
      location_id: 2, // Central Library
      date: '2026-10-04',
      approximate_time: '18:10',
      image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
      status: 'lost',
      private_details: 'Engraved with initials "D.K." on the flat magnetic edge.',
      reward: '$10 reward',
      storage_location: null,
      views_count: 27,
    },
    {
      id: 8,
      user_id: 1, // Alex Rivera
      type: 'lost',
      title: 'Toyota Car Key with Batman Keychain',
      category_id: 7, // Keys & Keychains
      description: 'Single black electronic key fob for Toyota Corolla attached to a metal Batman symbol keyring.',
      brand: 'Toyota',
      color: 'Black/Silver',
      model: 'Smart Key Fob',
      location_id: 8, // North Parking Lot
      date: '2026-10-06',
      approximate_time: '09:00',
      image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
      status: 'lost',
      private_details: 'Key fob has a cracked unlock button; keyring has a gym pass tag.',
      reward: '$25 reward',
      storage_location: null,
      views_count: 63,
    },
    {
      id: 9,
      user_id: 2, // Priya Sharma
      type: 'lost',
      title: 'HP 65W USB-C Laptop Fast Charger',
      category_id: 1, // Electronics
      description: 'Original black HP laptop power adapter with thick cord and USB-C tip left plugged into wall outlet near Lab 202.',
      brand: 'HP',
      color: 'Black',
      model: '65W USB-C Adapter',
      location_id: 3, // Computer Science Lab
      date: '2026-10-03',
      approximate_time: '16:40',
      image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
      status: 'lost',
      private_details: 'Has red electrical tape wrapped around the cable strain relief.',
      reward: null,
      storage_location: null,
      views_count: 18,
    },
    {
      id: 10,
      user_id: 3, // Marcus Chen
      type: 'lost',
      title: 'Digital Vernier Caliper in Blue Hard Case',
      category_id: 9, // Lab Equipment
      description: 'Stainless steel 150mm digital caliper in blue plastic case. Used during fabrication lab.',
      brand: 'Mitutoyo',
      color: 'Silver/Blue',
      model: '500-196-30 AOS',
      location_id: 5, // Mechanical Workshop
      date: '2026-10-02',
      approximate_time: '15:00',
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      status: 'returned',
      private_details: 'Marcus written with permanent black marker on back of case.',
      reward: null,
      storage_location: null,
      views_count: 45,
    },
    {
      id: 11,
      user_id: 4, // Emily Watson
      type: 'lost',
      title: 'Ray-Ban Tortoiseshell Eyeglasses',
      category_id: 5, // Accessories & Watches
      description: 'Round prescription reading glasses with tortoiseshell acetate frames in a black leather case.',
      brand: 'Ray-Ban',
      color: 'Brown Tortoise',
      model: 'RB5154 Clubmaster Optics',
      location_id: 2, // Central Library
      date: '2026-10-06',
      approximate_time: '12:30',
      image_url: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80',
      status: 'lost',
      private_details: 'Left arm has tiny scuff near hinge; cleaning cloth is light green.',
      reward: '$20 reward',
      storage_location: null,
      views_count: 22,
    },
    {
      id: 12,
      user_id: 5, // Rohan Patel
      type: 'lost',
      title: 'Navy Blue Nike Club Fleece Zip Hoodie',
      category_id: 8, // Clothing & Apparel
      description: 'Size L navy blue hoodie with white Nike swoosh on chest. Forgot on the chairs near Canteen juice stall.',
      brand: 'Nike',
      color: 'Navy Blue',
      model: 'Club Fleece Full-Zip',
      location_id: 6, // Campus Canteen
      date: '2026-10-05',
      approximate_time: '18:00',
      image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
      status: 'lost',
      private_details: 'Inner tag has written "R.P." with blue ballpoint pen.',
      reward: null,
      storage_location: null,
      views_count: 14,
    },
    {
      id: 13,
      user_id: 6, // Sarah Jenkins
      type: 'lost',
      title: 'Samsung Galaxy Watch 5 (44mm Graphite)',
      category_id: 5, // Accessories & Watches
      description: 'Black smartwatch with sports band. Slipped off wrist while playing volleyball at the sports ground.',
      brand: 'Samsung',
      color: 'Graphite Black',
      model: 'Galaxy Watch 5 44mm',
      location_id: 9, // Sports Complex
      date: '2026-10-04',
      approximate_time: '18:30',
      image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
      status: 'lost',
      private_details: 'Screen lock PIN is 4 digits; custom watch face with solar clock.',
      reward: '$40 reward',
      storage_location: null,
      views_count: 38,
    },
    {
      id: 14,
      user_id: 7, // David Kim
      type: 'lost',
      title: 'Kingston 128GB DataTraveler Metal USB Drive',
      category_id: 1, // Electronics
      description: 'Silver all-metal USB thumb drive containing Biotechnology semester 7 thesis drafts and datasets.',
      brand: 'Kingston',
      color: 'Silver',
      model: 'DT Kyson 128GB',
      location_id: 3, // Computer Science Lab
      date: '2026-10-06',
      approximate_time: '10:00',
      image_url: 'https://images.unsplash.com/photo-1628155930542-40a029759b30?auto=format&fit=crop&w=600&q=80',
      status: 'lost',
      private_details: 'Volume label is "DK_DATA"; keychain hole has a purple thread tied.',
      reward: '$30 reward',
      storage_location: null,
      views_count: 51,
    },
    {
      id: 15,
      user_id: 1, // Alex Rivera
      type: 'lost',
      title: 'Cambridge Hardbound A4 Graph Notebook',
      category_id: 4, // Books & Stationery
      description: 'Black and green grid-ruled laboratory notebook with calculus formulas and graph plots.',
      brand: 'Cambridge',
      color: 'Black/Green',
      model: 'A4 Grid Lab Note',
      location_id: 11, // Classroom Block Alpha
      date: '2026-10-01',
      approximate_time: '14:00',
      image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      status: 'returned',
      private_details: 'First page has syllabus checklist with green highlighter ticks.',
      reward: null,
      storage_location: null,
      views_count: 12,
    },

    // --- FOUND ITEMS (15 items) ---
    {
      id: 16,
      user_id: 8, // Officer James Hall (Staff)
      type: 'found',
      title: 'Black Wireless Earbuds in Charging Case',
      category_id: 1, // Electronics
      description: 'Found a pair of black true wireless earbuds in a black charging case left on desk 12 in Turing Block Computer Lab 204.',
      brand: 'JBL',
      color: 'Black',
      model: 'TWS In-Ear',
      location_id: 3, // Computer Science Lab
      date: '2026-10-05',
      approximate_time: '15:15',
      image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
      status: 'found',
      private_details: 'JBL logo on lid. Serial barcode ends in 492. Minor scuff on bottom edge.',
      reward: null,
      storage_location: 'Main Gate Security Office, Locker 4',
      views_count: 82,
    },
    {
      id: 17,
      user_id: 5, // Rohan Patel
      type: 'found',
      title: 'Casio Scientific Calculator with Solar Panel',
      category_id: 4, // Books & Stationery
      description: 'Found on bench 4 in Tesla Hall Electronics lab after the practical exam ended. Clean condition.',
      brand: 'Casio',
      color: 'Black/White',
      model: 'ClassWiz fx-991',
      location_id: 4, // Electronics Lab
      date: '2026-10-06',
      approximate_time: '12:00',
      image_url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
      status: 'found',
      private_details: 'Inside of plastic sliding cover has a cartoon sticker.',
      reward: null,
      storage_location: 'Tesla Hall Lab Assistant Desk',
      views_count: 39,
    },
    {
      id: 18,
      user_id: 4, // Emily Watson
      type: 'found',
      title: 'Dark Blue Insulated Metal Water Bottle',
      category_id: 10, // Water Bottles & Flasks
      description: 'Found near the sports ground bleachers after 6 PM. Solid steel wide-mouth insulated bottle.',
      brand: 'Hydro Flask',
      color: 'Blue',
      model: 'Wide Mouth Tumbler',
      location_id: 9, // Sports Complex
      date: '2026-10-04',
      approximate_time: '18:15',
      image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
      status: 'found',
      private_details: 'Distinctive sticker on side and small dent on bottom rim.',
      reward: null,
      storage_location: 'Sports Gym Equipment Desk',
      views_count: 28,
    },
    {
      id: 19,
      user_id: 9, // Dr. Linda Vance (Staff)
      type: 'found',
      title: 'Brown Leather Bi-fold Wallet',
      category_id: 6, // Wallets & Purses
      description: 'Handed over by cafeteria cleaning staff. Found under table in main canteen. Safe in security custody.',
      brand: 'Fossil',
      color: 'Brown',
      model: 'Leather Bi-fold',
      location_id: 6, // Campus Canteen
      date: '2026-10-06',
      approximate_time: '13:45',
      image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
      status: 'claim_pending',
      private_details: 'Contains student library card with ID ending in 014 and Polaroid picture.',
      reward: null,
      storage_location: 'Library Front Desk Lost & Found Drawer',
      views_count: 94,
    },
    {
      id: 20,
      user_id: 9, // Dr. Linda Vance (Staff)
      type: 'found',
      title: 'Student ID Card with Blue Lanyard',
      category_id: 2, // Documents & IDs
      description: 'Found on 2nd floor reading table in Central Library. Student name is visible on card.',
      brand: 'Metropolitan Institute',
      color: 'Blue/White',
      model: 'Student Smart Card',
      location_id: 2, // Central Library
      date: '2026-10-05',
      approximate_time: '17:00',
      image_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
      status: 'found',
      private_details: 'Student ID is EE-2023-076 (Rohan Patel). Barcode sticker present.',
      reward: null,
      storage_location: 'Central Library Circulation Desk',
      views_count: 47,
    },
    {
      id: 21,
      user_id: 8, // Officer James Hall (Staff)
      type: 'found',
      title: 'Car Key Fob with Metal Superhero Keyring',
      category_id: 7, // Keys & Keychains
      description: 'Found dropped along pedestrian path in North Parking Lot Bay B.',
      brand: 'Toyota',
      color: 'Black/Silver',
      model: 'Transponder Key',
      location_id: 8, // North Parking Lot
      date: '2026-10-06',
      approximate_time: '10:30',
      image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
      status: 'found',
      private_details: 'Batman metal logo and barcode tag for local gym.',
      reward: null,
      storage_location: 'Main Gate Security Office Key Box',
      views_count: 53,
    },
    {
      id: 22,
      user_id: 2, // Priya Sharma
      type: 'found',
      title: 'Silver 128GB Metal USB Thumb Drive',
      category_id: 1, // Electronics
      description: 'Found plugged into terminal PC #19 in Turing Block Computer Lab 202.',
      brand: 'Kingston',
      color: 'Silver',
      model: 'DataTraveler Metal',
      location_id: 3, // Computer Science Lab
      date: '2026-10-06',
      approximate_time: '11:30',
      image_url: 'https://images.unsplash.com/photo-1628155930542-40a029759b30?auto=format&fit=crop&w=600&q=80',
      status: 'found',
      private_details: 'Purple thread loop attached through the keyring hole; volume drive label is DK_DATA.',
      reward: null,
      storage_location: 'Lab 202 Proctor Desk',
      views_count: 36,
    },
    {
      id: 23,
      user_id: 3, // Marcus Chen
      type: 'found',
      title: 'Sony WH-1000XM4 Noise Canceling Headphones',
      category_id: 1, // Electronics
      description: 'Black over-ear premium headphones in hard zippered travel case. Left on bench in Tagore Hall auditorium lobby.',
      brand: 'Sony',
      color: 'Black',
      model: 'WH-1000XM4',
      location_id: 7, // Main Auditorium
      date: '2026-10-04',
      approximate_time: '19:00',
      image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
      status: 'found',
      private_details: 'Airplane audio adapter and gold braided 3.5mm cable inside internal net pocket.',
      reward: null,
      storage_location: 'Auditorium Management Office',
      views_count: 110,
    },
    {
      id: 24,
      user_id: 8, // Officer James Hall
      type: 'found',
      title: 'Room Keys Bundle with Leather Campus Tag',
      category_id: 7, // Keys & Keychains
      description: 'Set of 3 brass keys with a brown leather tag stamped "Quad B". Found near hostel courtyard.',
      brand: 'Generic',
      color: 'Brass/Brown',
      model: 'Dorm Door Keys',
      location_id: 10, // Student Hostels Quad
      date: '2026-10-05',
      approximate_time: '08:45',
      image_url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
      status: 'found',
      private_details: 'One key has a small red rubber color ring on head; tag has room number 214 lightly carved on back.',
      reward: null,
      storage_location: 'Hostel Block B Warden Desk',
      views_count: 25,
    },
    {
      id: 25,
      user_id: 5, // Rohan Patel
      type: 'found',
      title: 'Grey Under Armour Sports Duffel Bag',
      category_id: 3, // Bags & Backpacks
      description: 'Found on locker room bench at Olympic Gymnasium sports complex. Clean condition.',
      brand: 'Under Armour',
      color: 'Grey/Black',
      model: 'Undeniable 5.0 Duffel',
      location_id: 9, // Sports Complex
      date: '2026-10-05',
      approximate_time: '18:30',
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
      status: 'found',
      private_details: 'Contains white badminton shuttlecocks box and Wilson wristband.',
      reward: null,
      storage_location: 'Gym reception lost property cabinet',
      views_count: 42,
    },
    {
      id: 26,
      user_id: 9, // Dr. Linda Vance
      type: 'found',
      title: 'Tortoiseshell Reading Glasses in Hard Case',
      category_id: 5, // Accessories & Watches
      description: 'Left on study table 8 in Central Library Ground Floor reading room.',
      brand: 'Ray-Ban',
      color: 'Brown Tortoise',
      model: 'Clubmaster Style',
      location_id: 2, // Central Library
      date: '2026-10-06',
      approximate_time: '13:00',
      image_url: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&w=600&q=80',
      status: 'found',
      private_details: 'Lime green microfiber cloth inside case; frames have RayBan etching.',
      reward: null,
      storage_location: 'Library Front Desk',
      views_count: 31,
    },
    {
      id: 27,
      user_id: 6, // Sarah Jenkins
      type: 'found',
      title: 'White Lab Coat (Size M) with Safety Glasses',
      category_id: 9, // Lab Equipment
      description: 'Found draped over coat hanger in Chemistry/Biotech Prep Lab 102.',
      brand: 'LabArmor',
      color: 'White',
      model: 'Standard Unisex 100% Cotton',
      location_id: 11, // Classroom Block Alpha
      date: '2026-10-03',
      approximate_time: '17:15',
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      status: 'found',
      private_details: 'Safety goggles have blue ear pieces; inner pocket has a purple ballpoint pen.',
      reward: null,
      storage_location: 'Lab Prep Staff Room',
      views_count: 17,
    },
    {
      id: 28,
      user_id: 7, // David Kim
      type: 'found',
      title: 'Navy Blue Nike Full-Zip Sweatshirt',
      category_id: 8, // Clothing & Apparel
      description: 'Left on chair in cafeteria outdoor patio table.',
      brand: 'Nike',
      color: 'Navy Blue',
      model: 'Fleece Hoodie Size L',
      location_id: 6, // Campus Canteen
      date: '2026-10-05',
      approximate_time: '19:00',
      image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
      status: 'found',
      private_details: 'Inner care label has handwritten initials R.P.',
      reward: null,
      storage_location: 'Canteen Cash Counter',
      views_count: 24,
    },
    {
      id: 29,
      user_id: 8, // Officer James Hall
      type: 'found',
      title: 'Stainless Steel Digital Caliper Tool',
      category_id: 9, // Lab Equipment
      description: 'Handed in by workshop technician from Edison Workshop bay 3.',
      brand: 'Mitutoyo',
      color: 'Silver/Blue',
      model: 'Digital Caliper',
      location_id: 5, // Mechanical Workshop
      date: '2026-10-02',
      approximate_time: '16:00',
      image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      status: 'returned',
      private_details: 'Blue case with name Marcus marked on rear.',
      reward: null,
      storage_location: 'Returned to student Marcus Chen',
      views_count: 58,
    },
    {
      id: 30,
      user_id: 9, // Dr. Linda Vance
      type: 'found',
      title: 'Apple Pencil with Magnetic Charging Cap',
      category_id: 1, // Electronics
      description: 'Found under arm chair in 1st floor reading mezzanine.',
      brand: 'Apple',
      color: 'White',
      model: 'Pencil 2',
      location_id: 2, // Central Library
      date: '2026-10-04',
      approximate_time: '18:50',
      image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',
      status: 'found',
      private_details: 'Laser engraved letters "D.K." on flat facet.',
      reward: null,
      storage_location: 'Library Circulation Valuables Safe',
      views_count: 49,
    },
  ];

  const insertItem = db.prepare(`
    INSERT OR IGNORE INTO items (
      id, user_id, type, title, category_id, description, brand, color, model,
      location_id, date, approximate_time, image_url, status, private_details,
      reward, storage_location, views_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of items) {
    insertItem.run(
      item.id,
      item.user_id,
      item.type,
      item.title,
      item.category_id,
      item.description,
      item.brand,
      item.color,
      item.model,
      item.location_id,
      item.date,
      item.approximate_time,
      item.image_url,
      item.status,
      item.private_details,
      item.reward,
      item.storage_location,
      item.views_count
    );
  }

  // 6. Sample Claims
  const claims = [
    {
      id: 1,
      item_id: 19, // Found Brown Leather Wallet
      claimant_id: 4, // Emily Watson
      verification_answers: JSON.stringify({
        contents_or_unique_marks: 'Contains my student ID card with my name Emily Watson and 2 subway tokens in the coin slot.',
        colors_or_accents: 'Dark brown distress leather with vintage stitching.',
        serial_or_identifying_code: 'Library ID number ending in 014.',
        additional_proof: 'I have a photo of my dog tucked inside the clear ID window.'
      }),
      status: 'under_review',
      reviewed_by: 9, // Dr. Linda Vance
      admin_notes: 'Details match the wallet contents held at library desk. Scheduled handover.',
      created_at: '2026-10-06 14:15:00',
    },
    {
      id: 2,
      item_id: 29, // Found Caliper (Returned)
      claimant_id: 3, // Marcus Chen
      verification_answers: JSON.stringify({
        contents_or_unique_marks: 'Blue case has my first name "Marcus" written in black sharpie on the back.',
        colors_or_accents: 'Stainless steel with blue display bezel.',
        serial_or_identifying_code: 'Mitutoyo AOS 500-196-30.',
        additional_proof: 'Showed lab assignment registration receipt.'
      }),
      status: 'completed',
      reviewed_by: 8, // Officer Hall
      admin_notes: 'Claim verified in person at Security Office. Item returned to owner.',
      created_at: '2026-10-02 17:00:00',
    },
    {
      id: 3,
      item_id: 16, // Found JBL Earbuds
      claimant_id: 1, // Alex Rivera
      verification_answers: JSON.stringify({
        contents_or_unique_marks: 'Scratch on the bottom side of the case near the USB-C charging port.',
        colors_or_accents: 'Matte black case and earbuds with orange JBL interior accent.',
        serial_or_identifying_code: 'Serial ending in 492.',
        additional_proof: 'Can connect to my phone via Bluetooth to prove ownership.'
      }),
      status: 'pending',
      reviewed_by: null,
      admin_notes: null,
      created_at: '2026-10-06 09:30:00',
    },
  ];

  const insertClaim = db.prepare(`
    INSERT OR IGNORE INTO claims (id, item_id, claimant_id, verification_answers, status, reviewed_by, admin_notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const cl of claims) {
    insertClaim.run(cl.id, cl.item_id, cl.claimant_id, cl.verification_answers, cl.status, cl.reviewed_by, cl.admin_notes, cl.created_at);
  }

  // 7. Sample Messages
  const messages = [
    {
      id: 1,
      sender_id: 4, // Emily Watson
      receiver_id: 9, // Dr. Linda Vance (staff holding wallet)
      item_id: 19,
      message: 'Hello Dr. Vance, I submitted a claim for the brown Fossil wallet found in the canteen. I really need my ID card before tomorrow morning classes!',
      created_at: '2026-10-06 14:30:00',
      read_status: 1,
    },
    {
      id: 2,
      sender_id: 9, // Dr. Linda Vance
      receiver_id: 4, // Emily Watson
      item_id: 19,
      message: 'Hi Emily, your verification details match our inspection perfectly. The wallet is safe in our circulation desk valuables lockbox. You can collect it anytime before 7 PM today with your college registration slip.',
      created_at: '2026-10-06 14:45:00',
      read_status: 1,
    },
    {
      id: 3,
      sender_id: 4, // Emily Watson
      receiver_id: 9, // Dr. Linda Vance
      item_id: 19,
      message: 'Thank you so much! Heading over to the library right away.',
      created_at: '2026-10-06 14:50:00',
      read_status: 0,
    },
    {
      id: 4,
      sender_id: 1, // Alex Rivera
      receiver_id: 8, // Officer James Hall
      item_id: 16,
      message: 'Good morning Officer Hall, I submitted an ownership claim for the JBL earbuds found in Computer Lab 204. I can demonstrate pairing with my phone in person.',
      created_at: '2026-10-06 10:00:00',
      read_status: 1,
    },
    {
      id: 5,
      sender_id: 8, // Officer James Hall
      receiver_id: 1, // Alex Rivera
      item_id: 16,
      message: 'Hello Alex, please stop by the Main Gate Security Office between 11 AM and 3 PM today. We will verify your serial number and Bluetooth pairing at the desk.',
      created_at: '2026-10-06 10:15:00',
      read_status: 0,
    },
  ];

  const insertMessage = db.prepare(`
    INSERT OR IGNORE INTO messages (id, sender_id, receiver_id, item_id, message, created_at, read_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const m of messages) {
    insertMessage.run(m.id, m.sender_id, m.receiver_id, m.item_id, m.message, m.created_at, m.read_status);
  }

  // 8. Sample Notifications
  const notifications = [
    {
      id: 1,
      user_id: 1, // Alex Rivera
      title: '🔔 Possible Match Found — 91%',
      message: 'Officer James Hall reported finding "Black Wireless Earbuds" at Computer Science Lab which closely matches your lost report.',
      type: 'match',
      link: '/items/16',
      is_read: 0,
      created_at: '2026-10-05 15:30:00',
    },
    {
      id: 2,
      user_id: 2, // Priya Sharma
      title: '🔔 Possible Match Found — 88%',
      message: 'Rohan Patel reported finding "Casio Scientific Calculator" at Electronics Lab.',
      type: 'match',
      link: '/items/17',
      is_read: 0,
      created_at: '2026-10-06 12:10:00',
    },
    {
      id: 3,
      user_id: 4, // Emily Watson
      title: 'Claim Under Review',
      message: 'Dr. Linda Vance has reviewed your claim for "Brown Leather Bi-fold Wallet" and initiated handover verification.',
      type: 'claim_status',
      link: '/claims',
      is_read: 1,
      created_at: '2026-10-06 14:35:00',
    },
    {
      id: 4,
      user_id: 3, // Marcus Chen
      title: 'Item Successfully Returned!',
      message: 'Your Digital Vernier Caliper report has been marked as Returned. Thank you for using CampusFind!',
      type: 'returned',
      link: '/items/10',
      is_read: 1,
      created_at: '2026-10-02 17:30:00',
    },
    {
      id: 5,
      user_id: 1, // Alex Rivera
      title: 'New Message from Campus Security',
      message: 'Officer James Hall replied regarding your JBL Earbuds claim.',
      type: 'message',
      link: '/messages?item=16',
      is_read: 0,
      created_at: '2026-10-06 10:15:00',
    },
  ];

  const insertNotification = db.prepare(`
    INSERT OR IGNORE INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const n of notifications) {
    insertNotification.run(n.id, n.user_id, n.title, n.message, n.type, n.link, n.is_read, n.created_at);
  }

  // 9. Sample Reports (Flagged item for admin moderation)
  const reports = [
    {
      id: 1,
      reported_by: 2,
      item_id: 8,
      reason: 'Suspicious duplicate post or incorrect parking location description.',
      status: 'pending',
      created_at: '2026-10-06 11:00:00',
    },
  ];

  const insertReport = db.prepare(`
    INSERT OR IGNORE INTO reports (id, reported_by, item_id, reason, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const r of reports) {
    insertReport.run(r.id, r.reported_by, r.item_id, r.reason, r.status, r.created_at);
  }

  console.log('CampusFind database seeded successfully!');
}
