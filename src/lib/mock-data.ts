import type { Product, ShippingState, PromoCode, Order } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Whey Protein Isolate',
    description: 'High-quality, fast-absorbing whey protein isolate for muscle recovery and growth.',
    price: 49.99,
    quantity: 100,
    category: 'Protein',
    imageUrl: 'https://picsum.photos/400/400?random=1',
    options: {
      sizes: ['1kg', '2kg', '5kg'],
      flavors: ['Chocolate', 'Vanilla', 'Strawberry'],
    },
  },
  {
    id: '2',
    name: 'Creatine Monohydrate',
    description: 'Pure creatine monohydrate to boost strength, power, and muscle mass.',
    price: 24.99,
    quantity: 200,
    category: 'Performance',
    imageUrl: 'https://picsum.photos/400/400?random=2',
    options: {
      sizes: ['300g', '500g'],
    },
  },
  {
    id: '3',
    name: 'Pre-Workout Igniter',
    description: 'Explosive energy and focus to maximize your workout performance.',
    price: 39.99,
    quantity: 80,
    category: 'Pre-Workout',
    imageUrl: 'https://picsum.photos/400/400?random=3',
    options: {
      flavors: ['Blue Raspberry', 'Fruit Punch', 'Watermelon'],
      colors: ['Blue', 'Red', 'Pink'],
    },
  },
  {
    id: '4',
    name: 'Multivitamin Complex',
    description: 'A comprehensive blend of essential vitamins and minerals for overall health.',
    price: 19.99,
    quantity: 150,
    category: 'Health & Wellness',
    imageUrl: 'https://picsum.photos/400/400?random=4',
    options: {
      sizes: ['90 Tablets', '180 Tablets'],
    },
  },
    {
    id: '5',
    name: 'Omega-3 Fish Oil',
    description: 'High-potency fish oil for joint, brain, and heart health.',
    price: 15.99,
    quantity: 120,
    category: 'Health & Wellness',
    imageUrl: 'https://picsum.photos/400/400?random=5',
  },
  {
    id: '6',
    name: 'Vegan Protein Blend',
    description: 'A plant-based protein powder from pea, rice, and hemp sources.',
    price: 54.99,
    quantity: 70,
    category: 'Protein',
    imageUrl: 'https://picsum.photos/400/400?random=6',
    options: {
      flavors: ['Natural', 'Chocolate Fudge', 'Vanilla Bean'],
    },
  },
  {
    id: '7',
    name: 'BCAA 2:1:1',
    description: 'Branched-Chain Amino Acids to support muscle recovery and reduce fatigue.',
    price: 29.99,
    quantity: 90,
    category: 'Performance',
    imageUrl: 'https://picsum.photos/400/400?random=7',
    options: {
      flavors: ['Unflavored', 'Green Apple', 'Mango'],
      colors: ['White', 'Green', 'Orange'],
    },
  },
  {
    id: '8',
    name: 'Casein Protein',
    description: 'Slow-digesting protein for sustained muscle nourishment, ideal for nighttime use.',
    price: 52.99,
    quantity: 60,
    category: 'Protein',
    imageUrl: 'https://picsum.photos/400/400?random=8',
    options: {
      flavors: ['Creamy Chocolate', 'French Vanilla'],
    },
  },
];

export const shippingOptions: ShippingState[] = [
  {
    state: 'Algiers',
    cities: [
      { name: 'Algiers Center', price: 400 },
      { name: 'Hydra', price: 450 },
      { name: 'Kouba', price: 450 },
    ],
  },
  {
    state: 'Oran',
    cities: [
      { name: 'Oran Center', price: 600 },
      { name: 'Bir El Djir', price: 650 },
    ],
  },
  {
    state: 'Constantine',
    cities: [
      { name: 'Constantine Center', price: 500 },
      { name: 'El Khroub', price: 550 },
    ],
  },
];

export const promoCodes: PromoCode[] = [
    { code: 'SAVE10', discount: 10, type: 'percentage', used: false },
    { code: 'FIT20', discount: 20, type: 'percentage', used: false },
    { code: 'FREESHIP', discount: 0, type: 'fixed', used: true }, // Example for a used or different type
    { code: '500OFF', discount: 500, type: 'fixed', used: false },
];

export const orders: Order[] = [
  {
    id: 'ORD-001',
    customer: { name: 'John Doe', email: 'john.doe@email.com' },
    date: '2024-05-15',
    amount: 124.97,
    status: 'delivered',
    shippingAddress: { address: '123 Main St', city: 'Algiers Center', state: 'Algiers', phone: '0555112233' },
    items: [
      { product: products[0], quantity: 2, selectedFlavor: 'Chocolate' },
      { product: products[1], quantity: 1 },
    ],
  },
  {
    id: 'ORD-002',
    customer: { name: 'Jane Smith', email: 'jane.smith@email.com' },
    date: '2024-05-16',
    amount: 39.99,
    status: 'processing',
    shippingAddress: { address: '456 Oak Ave', city: 'Oran Center', state: 'Oran', phone: '0666445566' },
    items: [{ product: products[2], quantity: 1, selectedFlavor: 'Fruit Punch' }],
  },
  {
    id: 'ORD-003',
    customer: { name: 'Ali Benali', email: 'ali.benali@email.com' },
    date: '2024-05-17',
    amount: 78.97,
    status: 'shipped',
    shippingAddress: { address: '789 Pine Rd', city: 'El Khroub', state: 'Constantine', phone: '0777889900' },
    items: [
      { product: products[3], quantity: 1 },
      { product: products[5], quantity: 1, selectedFlavor: 'Vanilla Bean' },
    ],
  },
  {
    id: 'ORD-004',
    customer: { name: 'Fatima Zohra', email: 'fatima.zohra@email.com' },
    date: '2024-05-18',
    amount: 52.99,
    status: 'pending',
    shippingAddress: { address: '101 Palm St', city: 'Hydra', state: 'Algiers', phone: '0550123456' },
    items: [{ product: products[7], quantity: 1, selectedFlavor: 'Creamy Chocolate' }],
  },
];
