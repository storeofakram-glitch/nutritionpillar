import type { Product, ShippingState, PromoCode } from '@/types';

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
