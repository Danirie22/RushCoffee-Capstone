export interface ProductSize {
  name: 'Grande' | 'Venti' | 'Ala Carte' | 'Combo Meal';
  size: string;
  price: number;
}

export interface Product {
  id: string;
  name:string;
  description: string;
  category: 'Coffee Based' | 'Non-Coffee Based' | 'Matcha Series' | 'Refreshments' | 'Meals';
  sizes: ProductSize[];
  imageUrl: string;
  comboImageUrl?: string;
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

// Helper function to get the correct image path
const getImageUrl = (path: string) => {
  const base = import.meta.env.BASE_URL;
  return `${base}${path}`;
};

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
    imageUrl: getImageUrl('coffee-based/spanish-latte.png'),
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
    imageUrl: getImageUrl('coffee-based/rush-coffee-blend.png'),
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
    imageUrl: getImageUrl('coffee-based/caramel-chocolate-mocha.jpg'),
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
    imageUrl: getImageUrl('coffee-based/dark-chocolate-mocha.jpg'),
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
    imageUrl: getImageUrl('coffee-based/mocha-latte.jpg'),
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
    imageUrl: getImageUrl('coffee-based/americano.jpg'),
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
    imageUrl: getImageUrl('coffee-based/biscoff-latte.jpg'),
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
    imageUrl: getImageUrl('coffee-based/reeses-latte.jpg'),
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
    imageUrl: getImageUrl('coffee-based/brown-sugar-latte.jpg'),
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
    imageUrl: getImageUrl('coffee-based/iced-latte.jpg'),
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
    imageUrl: getImageUrl('coffee-based/orange-latte.jpg'),
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
    imageUrl: getImageUrl('coffee-based/coffee-jelly.jpg'),
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
    imageUrl: getImageUrl('non-coffee/red-velvet.jpg'),
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
    imageUrl: getImageUrl('non-coffee/red-velvet-matcha-latte.jpg'),
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
    imageUrl: getImageUrl('non-coffee/milky-choco.jpg'),
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
    imageUrl: getImageUrl('non-coffee/strawberry-milk.jpg'),
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
    imageUrl: getImageUrl('non-coffee/biscoff-milky.jpg'),
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
    imageUrl: getImageUrl('non-coffee/oreo-latte.jpg'),
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
    imageUrl: getImageUrl('matcha-series/matcha-latte.jpg'),
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
    imageUrl: getImageUrl('matcha-series/strawberry-matcha.jpg'),
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
    imageUrl: getImageUrl('matcha-series/matcha-cream-cheese.jpg'),
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
    imageUrl: getImageUrl('matcha-series/matcha-oreo.jpg'),
    available: true,
    stock: 99,
    displayOrder: 22,
  },

  // Refreshments
  {
    id: 'rf-01',
    name: 'Flamangooverload Shake',
    description: 'An explosive mix of flamingo and mango for an overload of fruity goodness.',
    category: 'Refreshments',
    sizes: [
        { name: 'Grande', size: '16oz', price: 69 },
        { name: 'Venti', size: '22oz', price: 79 },
    ],
    imageUrl: getImageUrl('refreshments/flamangooverload.jpg'),
    available: true,
    stock: 99,
    displayOrder: 23,
  },
  {
    id: 'rf-02',
    name: 'Mangoberry Shake',
    description: 'A delightful blend of sweet mangoes and tangy berries, perfectly refreshing.',
    category: 'Refreshments',
    sizes: [
        { name: 'Grande', size: '16oz', price: 79 },
        { name: 'Venti', size: '22oz', price: 99 },
    ],
    imageUrl: getImageUrl('refreshments/mangoberry.jpg'),
    available: true,
    stock: 99,
    displayOrder: 24,
  },
  {
    id: 'rf-03',
    name: 'Mango Caramel Shake',
    description: 'Creamy mango shake drizzled with rich, buttery caramel sauce.',
    category: 'Refreshments',
    sizes: [
        { name: 'Grande', size: '16oz', price: 79 },
        { name: 'Venti', size: '22oz', price: 99 },
    ],
    imageUrl: getImageUrl('refreshments/mango-caramel.jpg'),
    available: true,
    stock: 99,
    displayOrder: 25,
  },
  {
    id: 'rf-04',
    name: 'Blueberry Shake',
    description: 'A classic fruit shake made with sweet and juicy blueberries.',
    category: 'Refreshments',
    sizes: [
        { name: 'Grande', size: '16oz', price: 79 },
        { name: 'Venti', size: '22oz', price: 99 },
    ],
    imageUrl: getImageUrl('refreshments/blueberry-shake.jpg'),
    available: true,
    stock: 99,
    displayOrder: 26,
  },
  {
    id: 'rf-05',
    name: 'Strawberry Shake',
    description: 'A creamy and delicious shake made with ripe, sweet strawberries.',
    category: 'Refreshments',
    sizes: [
        { name: 'Grande', size: '16oz', price: 79 },
        { name: 'Venti', size: '22oz', price: 99 },
    ],
    imageUrl: getImageUrl('refreshments/strawberry-shake.jpg'),
    available: true,
    stock: 99,
    displayOrder: 27,
  },
  {
    id: 'rf-06',
    name: 'Green Apple Shake',
    description: 'A tart and refreshing shake with the crisp taste of green apples.',
    category: 'Refreshments',
    sizes: [
        { name: 'Grande', size: '16oz', price: 79 },
        { name: 'Venti', size: '22oz', price: 99 },
    ],
    imageUrl: getImageUrl('refreshments/green-apple-shake.jpg'),
    available: true,
    stock: 99,
    displayOrder: 28,
  },
  {
    id: 'rf-07',
    name: 'Blueberry Soda Pop',
    description: 'Fizzy and fun, this soda pop is bursting with sweet blueberry flavor.',
    category: 'Refreshments',
    sizes: [
        { name: 'Grande', size: '16oz', price: 69 },
        { name: 'Venti', size: '22oz', price: 79 },
    ],
    imageUrl: getImageUrl('refreshments/blueberry-soda.jpg'),
    available: true,
    stock: 99,
    displayOrder: 29,
  },
  {
    id: 'rf-08',
    name: 'Strawberry Soda Pop',
    description: 'A refreshing soda pop with the sweet taste of summer strawberries.',
    category: 'Refreshments',
    sizes: [
        { name: 'Grande', size: '16oz', price: 69 },
        { name: 'Venti', size: '22oz', price: 79 },
    ],
    imageUrl: getImageUrl('refreshments/strawberry-soda.jpg'),
    available: true,
    stock: 99,
    displayOrder: 30,
  },
    {
    id: 'rf-09',
    name: 'Green Apple Soda Pop',
    description: 'A crisp and bubbly soda with a tangy green apple twist.',
    category: 'Refreshments',
    sizes: [
        { name: 'Grande', size: '16oz', price: 69 },
        { name: 'Venti', size: '22oz', price: 79 },
    ],
    imageUrl: getImageUrl('refreshments/green-apple-soda.jpg'),
    available: true,
    stock: 99,
    displayOrder: 31,
  },
  {
    id: 'rf-10',
    name: 'Lemon Soda Pop',
    description: 'A zesty and invigorating soda pop with a classic lemon flavor.',
    category: 'Refreshments',
    sizes: [
        { name: 'Grande', size: '16oz', price: 69 },
        { name: 'Venti', size: '22oz', price: 79 },
    ],
    imageUrl: getImageUrl('refreshments/lemon-soda.jpg'),
    available: true,
    stock: 99,
    displayOrder: 32,
  },
  {
    id: 'rf-11',
    name: 'Lychee Soda Pop',
    description: 'An exotic and fragrant soda pop with the sweet, floral taste of lychee.',
    category: 'Refreshments',
    sizes: [
        { name: 'Grande', size: '16oz', price: 69 },
        { name: 'Venti', size: '22oz', price: 79 },
    ],
    imageUrl: getImageUrl('refreshments/lychee-soda.jpg'),
    available: true,
    stock: 99,
    displayOrder: 33,
  },
  {
    id: 'rf-12',
    name: 'Mango Soda Pop',
    description: 'A tropical and bubbly soda bursting with sweet mango flavor.',
    category: 'Refreshments',
    sizes: [
        { name: 'Grande', size: '16oz', price: 69 },
        { name: 'Venti', size: '22oz', price: 79 },
    ],
    imageUrl: getImageUrl('refreshments/mango-soda.jpg'),
    available: true,
    stock: 99,
    displayOrder: 34,
  },

  // Meals
  {
    id: 'ml-01',
    name: 'Breaded Bacon',
    description: 'Crispy breaded bacon served with creamy white sauce and golden fries.',
    category: 'Meals',
    sizes: [
        { name: 'Ala Carte', size: 'w/ Fries', price: 119 },
        { name: 'Combo Meal', size: 'w/ Fries & Drink', price: 139 },
    ],
    imageUrl: getImageUrl('menu/ala-carte-breaded-bacon-with-white-sauce and fries.jpg'),
    comboImageUrl: getImageUrl('menu/combo-meals-breaded-bacon-with-white-sauce,-fries-and-a-drink.jpg'),
    available: true,
    stock: 99,
    popular: true,
    displayOrder: 35,
  },
  {
    id: 'ml-02',
    name: 'Breaded Porkchop',
    description: 'A juicy breaded porkchop fried to perfection, served with white sauce and fries.',
    category: 'Meals',
    sizes: [
        { name: 'Ala Carte', size: 'w/ Fries', price: 129 },
        { name: 'Combo Meal', size: 'w/ Fries & Drink', price: 149 },
    ],
    imageUrl: getImageUrl('menu/ala-carte-breaded-porkchop-with-white-sauce-and-fries.jpg'),
    comboImageUrl: getImageUrl('menu/combo-meals-breaded-porkchop-with-white-sauce-and-fries-w-drink.jpg'),
    available: true,
    stock: 99,
    popular: true,
    displayOrder: 36,
  },
  {
    id: 'ml-03',
    name: 'Breaded Chicken',
    description: 'Tender breaded chicken fillet with a side of fries and our signature white sauce.',
    category: 'Meals',
    sizes: [
        { name: 'Ala Carte', size: 'w/ Fries', price: 119 },
        { name: 'Combo Meal', size: 'w/ Fries & Drink', price: 139 },
    ],
    imageUrl: getImageUrl('menu/ala-carte-chicken-with-white-sauce-and-fries.jpg'),
    comboImageUrl: getImageUrl('menu/combo-meals-breaded-chicken-with-white-sauce,-fries-and-a-drink.jpg'),
    available: true,
    stock: 99,
    displayOrder: 37,
  },
];