
export type IngredientCategory =
    | 'Coffee & Beans'
    | 'Dairy'
    | 'Sauces'
    | 'Syrups'
    | 'Specialty'
    | 'Matcha & Tea'
    | 'Fruits & Purees'
    | 'Beverages'
    | 'Frozen'
    | 'Proteins'
    | 'Dry Goods'
    | 'Supplies & Packaging';

export interface IngredientData {
    id: string;
    name: string;
    category: IngredientCategory;
    stock: number;
    unit: 'g' | 'ml' | 'pcs' | 'kg';
    lowStockThreshold: number;
    // Enhanced fields for customization system
    isTopping?: boolean;  // Flag to identify if this can be used as a topping
    toppingPrice?: number;  // Price when used as topping (only for toppings)
    portionSize?: number;  // Standard portion size per serving
    expirationDate?: string; // ISO date string for expiration tracking
}

export const mockIngredients: IngredientData[] = [
    // Coffee Ingredients
    { id: 'espresso-shot', name: 'Espresso Shot', category: 'Coffee & Beans', stock: 1000, unit: 'pcs', lowStockThreshold: 100 },
    { id: 'coffee-beans', name: 'Coffee Beans (Blend)', category: 'Coffee & Beans', stock: 10000, unit: 'g', lowStockThreshold: 1000 },

    // Milk & Dairy
    { id: 'milk', name: 'Milk', category: 'Dairy', stock: 20000, unit: 'ml', lowStockThreshold: 2000 },
    { id: 'condensed-milk', name: 'Condensed Milk', category: 'Dairy', stock: 5000, unit: 'ml', lowStockThreshold: 500 },
    { id: 'cream-cheese', name: 'Cream Cheese', category: 'Dairy', stock: 3000, unit: 'g', lowStockThreshold: 300 },
    { id: 'whipped-cream', name: 'Whipped Cream', category: 'Dairy', stock: 2000, unit: 'ml', lowStockThreshold: 200 },

    // Sauces & Syrups
    { id: 'chocolate-sauce', name: 'Chocolate Sauce', category: 'Sauces', stock: 3000, unit: 'ml', lowStockThreshold: 300 },
    { id: 'caramel-sauce', name: 'Caramel Sauce', category: 'Sauces', stock: 3000, unit: 'ml', lowStockThreshold: 300 },
    { id: 'brown-sugar-syrup', name: 'Brown Sugar Syrup', category: 'Syrups', stock: 2500, unit: 'ml', lowStockThreshold: 250, portionSize: 20 },
    { id: 'vanilla-syrup', name: 'Vanilla Syrup', category: 'Syrups', stock: 2000, unit: 'ml', lowStockThreshold: 200 },
    { id: 'orange-syrup', name: 'Orange Syrup', category: 'Syrups', stock: 1500, unit: 'ml', lowStockThreshold: 150 },

    // Specialty Ingredients & Toppings
    { id: 'biscoff-spread', name: 'Biscoff Spread', category: 'Specialty', stock: 2000, unit: 'g', lowStockThreshold: 200 },
    { id: 'peanut-butter', name: 'Peanut Butter', category: 'Specialty', stock: 2000, unit: 'g', lowStockThreshold: 200 },
    { id: 'oreo-crumbs', name: 'Oreo Cookie Crumbs', category: 'Specialty', stock: 3000, unit: 'g', lowStockThreshold: 300 },
    { id: 'coffee-jelly', name: 'Coffee Jelly', category: 'Specialty', stock: 2500, unit: 'g', lowStockThreshold: 250 },
    { id: 'red-velvet-powder', name: 'Red Velvet Powder', category: 'Specialty', stock: 2000, unit: 'g', lowStockThreshold: 200 },

    // Toppings (Enhanced with topping-specific fields)
    {
        id: 'pearls',
        name: 'Pearls',
        category: 'Specialty',
        stock: 3000,
        unit: 'g',
        lowStockThreshold: 300,
        isTopping: true,
        toppingPrice: 10,
        portionSize: 30  // 30g per serving
    },
    {
        id: 'pudding',
        name: 'Pudding',
        category: 'Specialty',
        stock: 2000,
        unit: 'g',
        lowStockThreshold: 200,
        isTopping: true,
        toppingPrice: 15,
        portionSize: 40  // 40g per serving
    },
    {
        id: 'grass-jelly',
        name: 'Grass Jelly',
        category: 'Specialty',
        stock: 2500,
        unit: 'g',
        lowStockThreshold: 250,
        isTopping: true,
        toppingPrice: 15,
        portionSize: 35  // 35g per serving
    },

    // Matcha & Tea
    { id: 'matcha-powder', name: 'Matcha Powder', category: 'Matcha & Tea', stock: 2000, unit: 'g', lowStockThreshold: 200 },

    // Fruits & Purees
    { id: 'strawberry-puree', name: 'Strawberry Puree', category: 'Fruits & Purees', stock: 4000, unit: 'ml', lowStockThreshold: 400 },
    { id: 'mango-puree', name: 'Mango Puree', category: 'Fruits & Purees', stock: 4000, unit: 'ml', lowStockThreshold: 400 },
    { id: 'blueberry-puree', name: 'Blueberry Puree', category: 'Fruits & Purees', stock: 3000, unit: 'ml', lowStockThreshold: 300 },
    { id: 'green-apple-puree', name: 'Green Apple Puree', category: 'Fruits & Purees', stock: 3000, unit: 'ml', lowStockThreshold: 300 },
    { id: 'lemon-juice', name: 'Lemon Juice', category: 'Fruits & Purees', stock: 2000, unit: 'ml', lowStockThreshold: 200 },
    { id: 'lychee-syrup', name: 'Lychee Syrup', category: 'Syrups', stock: 2000, unit: 'ml', lowStockThreshold: 200 },
    { id: 'mixed-berries', name: 'Mixed Berries', category: 'Fruits & Purees', stock: 2000, unit: 'g', lowStockThreshold: 200 },

    // Soda & Carbonation
    { id: 'soda-water', name: 'Soda Water', category: 'Beverages', stock: 10000, unit: 'ml', lowStockThreshold: 1000 },

    // Ice & Water (Enhanced with portion sizes)
    {
        id: 'ice-cubes',
        name: 'Ice Cubes',
        category: 'Frozen',
        stock: 50000,
        unit: 'g',
        lowStockThreshold: 5000,
        portionSize: 100  // 100g for normal ice level
    },
    { id: 'hot-water', name: 'Hot Water', category: 'Beverages', stock: 99999, unit: 'ml', lowStockThreshold: 10000 },

    // Meal Ingredients
    { id: 'bacon-strips', name: 'Bacon Strips', category: 'Proteins', stock: 5, unit: 'kg', lowStockThreshold: 1, portionSize: 0.1 },
    { id: 'porkchop', name: 'Porkchop', category: 'Proteins', stock: 4, unit: 'kg', lowStockThreshold: 1, portionSize: 0.2 },
    { id: 'chicken-fillet', name: 'Chicken Fillet', category: 'Proteins', stock: 5, unit: 'kg', lowStockThreshold: 1, portionSize: 0.15 },
    { id: 'bread-crumbs', name: 'Bread Crumbs', category: 'Dry Goods', stock: 3000, unit: 'g', lowStockThreshold: 300 },
    { id: 'french-fries', name: 'French Fries', category: 'Frozen', stock: 6, unit: 'kg', lowStockThreshold: 1, portionSize: 0.15 },
    { id: 'white-sauce', name: 'White Sauce', category: 'Sauces', stock: 2000, unit: 'ml', lowStockThreshold: 200 },
    { id: 'cooking-oil', name: 'Cooking Oil', category: 'Dry Goods', stock: 5000, unit: 'ml', lowStockThreshold: 500, expirationDate: '2025-12-31' },

    // Supplies & Packaging
    { id: 'cup-grande', name: 'Cup - Grande (16oz)', category: 'Supplies & Packaging', stock: 500, unit: 'pcs', lowStockThreshold: 50, portionSize: 1 },
    { id: 'cup-venti', name: 'Cup - Venti (20oz)', category: 'Supplies & Packaging', stock: 500, unit: 'pcs', lowStockThreshold: 50, portionSize: 1 },
    { id: 'lid-grande', name: 'Lid - Grande', category: 'Supplies & Packaging', stock: 500, unit: 'pcs', lowStockThreshold: 50, portionSize: 1 },
    { id: 'lid-venti', name: 'Lid - Venti', category: 'Supplies & Packaging', stock: 500, unit: 'pcs', lowStockThreshold: 50, portionSize: 1 },
    { id: 'straw', name: 'Straws', category: 'Supplies & Packaging', stock: 1000, unit: 'pcs', lowStockThreshold: 100, portionSize: 1 },
    { id: 'napkins', name: 'Napkins', category: 'Supplies & Packaging', stock: 2000, unit: 'pcs', lowStockThreshold: 200, portionSize: 2 },
    { id: 'takeout-pack', name: 'Takeout Pack (Meal Box)', category: 'Supplies & Packaging', stock: 300, unit: 'pcs', lowStockThreshold: 30, portionSize: 1 },
];
