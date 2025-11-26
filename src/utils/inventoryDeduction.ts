import { db } from '../firebaseConfig';
import firebase from 'firebase/compat/app';
import { Customizations } from '../context/CartContext';
import { mockCustomizationOptions } from '../data/mockCustomizationOptions';
import { mockProducts } from '../data/mockProducts';

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    customizations?: Customizations;
    size?: string;
}

/**
 * Deducts ingredients from inventory based on order items and customizations
 * This should be called when an order status changes to 'preparing'
 */
export const deductInventoryForOrder = async (orderItems: OrderItem[]): Promise<void> => {
    try {
        const batch = db.batch();
        const ingredientsRef = db.collection('ingredients');

        for (const item of orderItems) {
            console.log(`🔄 Processing item: ${item.productName} (ID: ${item.productId})`);
            const { quantity, customizations } = item;

            // 1. Deduct sugar syrup based on sugar level
            if (customizations?.sugarLevel) {
                const sugarLevelData = mockCustomizationOptions.sugarLevels.find(
                    (level) => level.value === customizations.sugarLevel
                );

                if (sugarLevelData && sugarLevelData.sugarAmount > 0) {
                    const sugarIngredientRef = ingredientsRef.doc(sugarLevelData.sugarIngredientId);
                    const totalSugarAmount = sugarLevelData.sugarAmount * quantity;

                    batch.update(sugarIngredientRef, {
                        stock: firebase.firestore.FieldValue.increment(-totalSugarAmount),
                    });

                    console.log(`Deducting ${totalSugarAmount}ml of ${sugarLevelData.sugarIngredientId} for ${item.productName}`);
                }
            }

            // 2. Deduct ice based on ice level
            if (customizations?.iceLevel) {
                const iceLevelData = mockCustomizationOptions.iceLevels.find(
                    (level) => level.value === customizations.iceLevel
                );

                if (iceLevelData && iceLevelData.iceAmount > 0) {
                    const iceIngredientRef = ingredientsRef.doc(iceLevelData.iceIngredientId);
                    const totalIceAmount = iceLevelData.iceAmount * quantity;

                    batch.update(iceIngredientRef, {
                        stock: firebase.firestore.FieldValue.increment(-totalIceAmount),
                    });

                    console.log(`Deducting ${totalIceAmount}g of ${iceLevelData.iceIngredientId} for ${item.productName}`);
                }
            }

            // 3. Deduct toppings
            if (customizations?.toppings && customizations.toppings.length > 0) {
                for (const toppingName of customizations.toppings) {
                    // Find topping by name
                    const toppingSnapshot = await ingredientsRef
                        .where('name', '==', toppingName)
                        .where('isTopping', '==', true)
                        .limit(1)
                        .get();

                    if (!toppingSnapshot.empty) {
                        const toppingDoc = toppingSnapshot.docs[0];
                        const toppingData = toppingDoc.data();
                        const portionSize = toppingData.portionSize || 30; // Default 30g if not specified
                        const totalToppingAmount = portionSize * quantity;

                        batch.update(toppingDoc.ref, {
                            stock: firebase.firestore.FieldValue.increment(-totalToppingAmount),
                        });

                        console.log(`Deducting ${totalToppingAmount}g of ${toppingName} for ${item.productName}`);
                    } else {
                        console.warn(`Topping "${toppingName}" not found in inventory`);
                    }
                }
            }

            // 4. Deduct base recipe ingredients
            const product = mockProducts.find(p => p.id === item.productId);
            if (product) {
                console.log(`🔍 Found product for deduction: ${product.name} (Recipe: ${product.recipe ? product.recipe.length : 0} items)`);

                // 4a. Deduct Recipe Ingredients
                if (product.recipe) {
                    for (const ingredient of product.recipe) {
                        const ingredientRef = ingredientsRef.doc(ingredient.ingredientId);
                        const totalAmount = ingredient.quantity * quantity;

                        batch.update(ingredientRef, {
                            stock: firebase.firestore.FieldValue.increment(-totalAmount)
                        });

                        console.log(`📉 Deducting ${totalAmount} of ${ingredient.ingredientId} for ${item.productName} (Qty: ${quantity})`);
                    }
                } else {
                    console.warn(`⚠️ Product ${product.name} has no recipe defined.`);
                }

                // 4b. Deduct Packaging (Cups, Lids, Straws, Napkins, Takeout Packs)
                const isBeverage = ['Coffee Based', 'Non-Coffee Based', 'Matcha Series', 'Refreshments'].includes(product.category);
                const isMeal = ['Meals'].includes(product.category);

                if (isBeverage && item.size) {
                    const sizeLower = item.size.toLowerCase();
                    let cupId = '';
                    let lidId = '';

                    if (sizeLower === 'grande') {
                        cupId = 'cup-grande';
                        lidId = 'lid-grande';
                    } else if (sizeLower === 'venti') {
                        cupId = 'cup-venti';
                        lidId = 'lid-venti';
                    }

                    // Deduct Cup
                    if (cupId) {
                        batch.update(ingredientsRef.doc(cupId), {
                            stock: firebase.firestore.FieldValue.increment(-quantity)
                        });
                        console.log(`🥤 Deducting ${quantity} ${cupId}`);
                    }

                    // Deduct Lid
                    if (lidId) {
                        batch.update(ingredientsRef.doc(lidId), {
                            stock: firebase.firestore.FieldValue.increment(-quantity)
                        });
                        console.log(`🥤 Deducting ${quantity} ${lidId}`);
                    }

                    // Deduct Straw (1 per beverage)
                    batch.update(ingredientsRef.doc('straw'), {
                        stock: firebase.firestore.FieldValue.increment(-quantity)
                    });
                    console.log(`🥤 Deducting ${quantity} straw`);

                    // Deduct Napkins (2 per beverage)
                    batch.update(ingredientsRef.doc('napkins'), {
                        stock: firebase.firestore.FieldValue.increment(-(quantity * 2))
                    });
                    console.log(`🧻 Deducting ${quantity * 2} napkins (beverage)`);
                }

                // Deduct Meal Packaging
                if (isMeal) {
                    // Deduct Takeout Pack
                    batch.update(ingredientsRef.doc('takeout-pack'), {
                        stock: firebase.firestore.FieldValue.increment(-quantity)
                    });
                    console.log(`🥡 Deducting ${quantity} takeout-pack`);

                    // Deduct Napkins (2 per meal)
                    batch.update(ingredientsRef.doc('napkins'), {
                        stock: firebase.firestore.FieldValue.increment(-(quantity * 2))
                    });
                    console.log(`🧻 Deducting ${quantity * 2} napkins (meal)`);
                }

            } else {
                console.error(`❌ Product not found in mockProducts: ${item.productId}`);
            }
        }

        // Commit all updates in a single batch
        await batch.commit();
        console.log('✅ Inventory deducted successfully for order');
    } catch (error) {
        console.error('❌ Error deducting inventory:', error);
        throw error;
    }
};

/**
 * Checks if there's enough stock for an order before placing it
 * Returns true if all items have sufficient stock, false otherwise
 */
export const checkInventoryAvailability = async (orderItems: OrderItem[]): Promise<{
    available: boolean;
    insufficientItems: string[];
}> => {
    try {
        const insufficientItems: string[] = [];
        const ingredientsRef = db.collection('ingredients');

        for (const item of orderItems) {
            const { quantity, customizations } = item;

            // Check sugar syrup
            if (customizations?.sugarLevel) {
                const sugarLevelData = mockCustomizationOptions.sugarLevels.find(
                    (level) => level.value === customizations.sugarLevel
                );

                if (sugarLevelData && sugarLevelData.sugarAmount > 0) {
                    const sugarDoc = await ingredientsRef.doc(sugarLevelData.sugarIngredientId).get();
                    if (sugarDoc.exists) {
                        const currentStock = sugarDoc.data()?.stock || 0;
                        const required = sugarLevelData.sugarAmount * quantity;
                        if (currentStock < required) {
                            insufficientItems.push(`Sugar syrup (need ${required}ml, have ${currentStock}ml)`);
                        }
                    }
                }
            }

            // Check ice
            if (customizations?.iceLevel) {
                const iceLevelData = mockCustomizationOptions.iceLevels.find(
                    (level) => level.value === customizations.iceLevel
                );

                if (iceLevelData && iceLevelData.iceAmount > 0) {
                    const iceDoc = await ingredientsRef.doc(iceLevelData.iceIngredientId).get();
                    if (iceDoc.exists) {
                        const currentStock = iceDoc.data()?.stock || 0;
                        const required = iceLevelData.iceAmount * quantity;
                        if (currentStock < required) {
                            insufficientItems.push(`Ice (need ${required}g, have ${currentStock}g)`);
                        }
                    }
                }
            }

            // Check toppings
            if (customizations?.toppings && customizations.toppings.length > 0) {
                for (const toppingName of customizations.toppings) {
                    const toppingSnapshot = await ingredientsRef
                        .where('name', '==', toppingName)
                        .where('isTopping', '==', true)
                        .limit(1)
                        .get();

                    if (!toppingSnapshot.empty) {
                        const toppingDoc = toppingSnapshot.docs[0];
                        const toppingData = toppingDoc.data();
                        const currentStock = toppingData.stock || 0;
                        const portionSize = toppingData.portionSize || 30;
                        const required = portionSize * quantity;

                        if (currentStock < required) {
                            insufficientItems.push(`${toppingName} (need ${required}g, have ${currentStock}g)`);
                        }
                    }
                }
            }
        }

        return {
            available: insufficientItems.length === 0,
            insufficientItems,
        };
    } catch (error) {
        console.error('Error checking inventory availability:', error);
        return {
            available: false,
            insufficientItems: ['Error checking inventory'],
        };
    }
};
