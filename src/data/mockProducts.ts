


export interface ProductSize {
  name: 'Grande' | 'Venti';
  size: '16oz' | '22oz';
  price: number;
}

export interface Product {
  id: string;
  name:string;
  description: string;
  category: 'Coffee Based' | 'Non-Coffee Based' | 'Matcha Series';
  sizes: ProductSize[];
  imageUrl: string;
  available: boolean;
  stock: number;
  popular?: boolean;
  new?: boolean;
  displayOrder: number;
  recipe?: Array<{
    ingredientId: string;
    quantity: number;
  }>;
}

export const mockProducts: Product[] = [
  // Coffee Based
  {
    id: 'cb-01',
    name: 'Spanish Latte',
    description: 'A creamy and sweet latte with a Spanish twist, featuring condensed milk for a rich flavor.',
    category: 'Coffee Based',
    sizes: [
        { name: 'Grande', size: '16oz', price: 59 },
        { name: 'Venti', size: '22oz', price: 69 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1621289191399-074a1d134887?q=80&w=600',
    available: true,
    stock: 99,
    popular: true,
    displayOrder: 1,
    recipe: [
        { ingredientId: 'espresso-shot', quantity: 2 },
        { ingredientId: 'milk', quantity: 150 },
        { ingredientId: 'condensed-milk', quantity: 30 },
    ],
  },
  {
    id: 'cb-02',
    name: 'Rush Coffee Blend',
    description: "Our signature house blend, perfectly balanced for a smooth and satisfying coffee experience.",
    category: 'Coffee Based',
    sizes: [
        { name: 'Grande', size: '16oz', price: 69 },
        { name: 'Venti', size: '22oz', price: 89 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1589341323325-16c8f94685f8?q=80&w=600',
    available: true,
    stock: 99,
    popular: true,
    displayOrder: 2,
    recipe: [
        { ingredientId: 'coffee-beans-blend', quantity: 18 },
        { ingredientId: 'hot-water', quantity: 200 },
    ],
  },
  {
    id: 'cb-03',
    name: 'Caramel Chocolate Mocha',
    description: "A decadent mix of rich chocolate, espresso, and creamy caramel for the ultimate treat.",
    category: 'Coffee Based',
    sizes: [
        { name: 'Grande', size: '16oz', price: 59 },
        { name: 'Venti', size: '22oz', price: 69 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1603803204918-a0833a6f3b25?q=80&w=600',
    available: true,
    stock: 99,
    popular: true,
    displayOrder: 3,
    recipe: [
        { ingredientId: 'espresso-shot', quantity: 2 },
        { ingredientId: 'milk', quantity: 150 },
        { ingredientId: 'chocolate-sauce', quantity: 20 },
        { ingredientId: 'caramel-sauce', quantity: 15 },
    ],
  },
  {
    id: 'cb-04',
    name: 'Dark Chocolate Mocha',
    description: "A bold and intense mocha experience with premium dark chocolate and strong espresso.",
    category: 'Coffee Based',
    sizes: [
        { name: 'Grande', size: '16oz', price: 59 },
        { name: 'Venti', size: '22oz', price: 69 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1542326588-e8a2455822ff?q=80&w=600',
    available: true,
    stock: 99,
    displayOrder: 4,
  },
  {
    id: 'cb-05',
    name: 'Mocha Latte',
    description: "A classic blend of smooth espresso, rich chocolate sauce, and steamed milk.",
    category: 'Coffee Based',
    sizes: [
        { name: 'Grande', size: '16oz', price: 59 },
        { name: 'Venti', size: '22oz', price: 69 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1623112142751-0a9981836104?q=80&w=600',
    available: true,
    stock: 99,
    displayOrder: 5,
  },
  {
    id: 'cb-06',
    name: 'Americano',
    description: "Bold espresso shots topped with hot water to create a light layer of crema.",
    category: 'Coffee Based',
    sizes: [
        { name: 'Grande', size: '16oz', price: 59 },
        { name: 'Venti', size: '22oz', price: 69 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?q=80&w=600',
    available: true,
    stock: 99,
    displayOrder: 6,
  },
  {
    id: 'cb-07',
    name: 'Biscoff Latte',
    description: "An indulgent latte infused with the irresistible flavor of caramelized Biscoff cookies.",
    category: 'Coffee Based',
    sizes: [
        { name: 'Grande', size: '16oz', price: 99 },
        { name: 'Venti', size: '22oz', price: 199 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1610890693148-e1db6f51f47a?q=80&w=600',
    available: true,
    stock: 99,
    displayOrder: 7,
  },
  {
    id: 'cb-08',
    name: 'Reeses Latte',
    description: "The perfect combination of peanut butter, chocolate, and espresso. A candy lover's dream.",
    category: 'Coffee Based',
    sizes: [
        { name: 'Grande', size: '16oz', price: 79 },
        { name: 'Venti', size: '22oz', price: 99 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1611082596937-293699a6d36f?q=80&w=600',
    available: true,
    stock: 99,
    displayOrder: 8,
  },
  {
    id: 'cb-09',
    name: 'Brown Sugar Latte',
    description: "A comforting latte sweetened with rich, molasses-like brown sugar syrup.",
    category: 'Coffee Based',
    sizes: [
        { name: 'Grande', size: '16oz', price: 59 },
        { name: 'Venti', size: '22oz', price: 79 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1630449942323-28d11634a36f?q=80&w=600',
    available: true,
    stock: 99,
    displayOrder: 9,
  },
  {
    id: 'cb-10',
    name: 'Iced Latte',
    description: "A simple classic. Chilled espresso with cold milk served over ice.",
    category: 'Coffee Based',
    sizes: [
        { name: 'Grande', size: '16oz', price: 69 },
        { name: 'Venti', size: '22oz', price: 69 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1589396520838-03c642278453?q=80&w=600',
    available: true,
    stock: 99,
    displayOrder: 10,
  },
  {
    id: 'cb-11',
    name: 'Orange Latte',
    description: "A unique and refreshing latte with a zesty hint of natural orange flavor.",
    category: 'Coffee Based',
    sizes: [
        { name: 'Grande', size: '16oz', price: 79 },
        { name: 'Venti', size: '22oz', price: 89 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1610889556528-9a742f161427?q=80&w=600',
    available: true,
    stock: 99,
    displayOrder: 11,
  },
  {
    id: 'cb-12',
    name: 'Coffee Jelly',
    description: "A delightful iced coffee drink with chewy, coffee-flavored jelly cubes.",
    category: 'Coffee Based',
    sizes: [
        { name: 'Grande', size: '16oz', price: 89 },
        { name: 'Venti', size: '22oz', price: 99 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1572498873426-9d6f3e0d2b7e?q=80&w=600',
    available: true,
    stock: 99,
    displayOrder: 12,
  },

  // Non-Coffee Based
  {
    id: 'nc-01',
    name: 'Red Velvet',
    description: "A sweet and creamy drink inspired by the classic red velvet cake, with hints of cocoa and vanilla.",
    category: 'Non-Coffee Based',
    sizes: [
        { name: 'Grande', size: '16oz', price: 89 },
        { name: 'Venti', size: '22oz', price: 109 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1600718374662-0483d2b9da44?q=80&w=600',
    available: true,
    stock: 99,
    displayOrder: 13,
  },
  {
    id: 'nc-02',
    name: 'Red Velvet Matcha Latte',
    description: "A beautiful and delicious blend of earthy matcha and sweet red velvet flavors.",
    category: 'Non-Coffee Based',
    sizes: [
        { name: 'Grande', size: '16oz', price: 89 },
        { name: 'Venti', size: '22oz', price: 109 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1563822558223-5a2a8adea614?q=80&w=600',
    available: true,
    stock: 99,
    displayOrder: 14,
  },
  {
    id: 'nc-03',
    name: 'Milky Choco',
    description: "A rich and comforting chocolate drink made with high-quality cocoa and fresh milk.",
    category: 'Non-Coffee Based',
    sizes: [
        { name: 'Grande', size: '16oz', price: 89 },
        { name: 'Venti', size: '22oz', price: 109 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1542848523-2a4721a78736?q=80&w=600',
    available: true,
    stock: 99,
    displayOrder: 15,
  },
  {
    id: 'nc-04',
    name: 'Strawberry Milk',
    description: "A refreshing and creamy drink made with real strawberries and fresh milk.",
    category: 'Non-Coffee Based',
    sizes: [
        { name: 'Grande', size: '16oz', price: 89 },
        { name: 'Venti', size: '22oz', price: 109 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1622171129302-1f486241a87e?q=80&w=600',
    available: true,
    stock: 99,
    displayOrder: 16,
  },
  {
    id: 'nc-05',
    name: 'Biscoff Milky',
    description: "A non-coffee treat blending the sweet, caramelized taste of Biscoff with creamy milk.",
    category: 'Non-Coffee Based',
    sizes: [
        { name: 'Grande', size: '16oz', price: 89 },
        { name: 'Venti', size: '22oz', price: 109 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1596700249549-8055f1f99b24?q=80&w=600',
    available: true,
    stock: 99,
    displayOrder: 17,
  },
    {
    id: 'nc-06',
    name: 'Oreo Latte',
    description: "A fun and delicious drink packed with the classic cookies and cream flavor of Oreos.",
    category: 'Non-Coffee Based',
    sizes: [
        { name: 'Grande', size: '16oz', price: 89 },
        { name: 'Venti', size: '22oz', price: 109 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1625194657116-2a9a11da4821?q=80&w=600',
    available: true,
    stock: 99,
    displayOrder: 18,
  },

  // Matcha Series
  {
    id: 'ms-01',
    name: 'Matcha Latte',
    description: "Premium Japanese matcha green tea with steamed milk, a perfect balance of earthy and creamy.",
    category: 'Matcha Series',
    sizes: [
        { name: 'Grande', size: '16oz', price: 69 },
        { name: 'Venti', size: '22oz', price: 89 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1577968897966-3d4325b36def?q=80&w=600',
    available: true,
    stock: 99,
    popular: true,
    displayOrder: 19,
     recipe: [
        { ingredientId: 'matcha-powder', quantity: 5 },
        { ingredientId: 'milk', quantity: 200 },
    ],
  },
  {
    id: 'ms-02',
    name: 'Strawberry Matcha',
    description: "A delightful pairing of sweet strawberry puree and high-quality matcha green tea.",
    category: 'Matcha Series',
    sizes: [
        { name: 'Grande', size: '16oz', price: 99 },
        { name: 'Venti', size: '22oz', price: 109 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1615837197154-2e801f9bd236?q=80&w=600',
    available: true,
    stock: 99,
    displayOrder: 20,
  },
  {
    id: 'ms-03',
    name: 'Matcha Cream Cheese',
    description: "Earthy matcha topped with a rich, savory, and slightly sweet cream cheese foam.",
    category: 'Matcha Series',
    sizes: [
        { name: 'Grande', size: '16oz', price: 99 },
        { name: 'Venti', size: '22oz', price: 109 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1587764353351-d4a4bca0f17e?q=80&w=600',
    available: true,
    stock: 99,
    displayOrder: 21,
  },
  {
    id: 'ms-04',
    name: 'Matcha Oreo',
    description: "A creative blend of matcha and crushed Oreo cookies for a unique texture and flavor.",
    category: 'Matcha Series',
    sizes: [
        { name: 'Grande', size: '16oz', price: 79 },
        { name: 'Venti', size: '22oz', price: 99 },
    ],
    imageUrl: 'https://images.unsplash.com/photo-1562376556-a65529391005?q=80&w=600',
    available: true,
    stock: 99,
    displayOrder: 22,
  },
];