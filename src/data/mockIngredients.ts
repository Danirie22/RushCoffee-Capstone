
export interface IngredientData {
    name: string;
    stock: number;
    unit: 'g' | 'ml' | 'pcs';
    lowStockThreshold: number;
}

export const mockIngredients: IngredientData[] = [
    { name: 'Espresso Shot', stock: 1000, unit: 'pcs', lowStockThreshold: 100 },
    { name: 'Milk', stock: 20000, unit: 'ml', lowStockThreshold: 2000 },
    { name: 'Condensed Milk', stock: 5000, unit: 'ml', lowStockThreshold: 500 },
    { name: 'Coffee Beans (Blend)', stock: 10000, unit: 'g', lowStockThreshold: 1000 },
    { name: 'Hot Water', stock: 99999, unit: 'ml', lowStockThreshold: 10000 },
    { name: 'Chocolate Sauce', stock: 3000, unit: 'ml', lowStockThreshold: 300 },
    { name: 'Caramel Sauce', stock: 3000, unit: 'ml', lowStockThreshold: 300 },
    { name: 'Matcha Powder', stock: 2000, unit: 'g', lowStockThreshold: 200 },
];
