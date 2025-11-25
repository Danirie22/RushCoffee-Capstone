import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';

export interface SalesDataPoint {
    date: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
}

export interface TopProduct {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
}

export interface CategorySales {
    category: string;
    revenue: number;
    orders: number;
}

export interface PeakHour {
    hour: number;
    orders: number;
    revenue: number;
}

export type TimeRange = 'today' | 'week' | 'month' | 'year';

export const useSalesData = (timeRange: TimeRange = 'today') => {
    const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
    const [peakHours, setPeakHours] = useState<PeakHour[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSalesData = async () => {
            setIsLoading(true);
            try {
                const { startDate, endDate } = getDateRange(timeRange);

                // Fetch orders within the time range
                const ordersSnapshot = await db
                    .collection('orders')
                    .where('timestamp', '>=', startDate)
                    .where('timestamp', '<', endDate)
                    .get();

                const orders = ordersSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        orderItems: data.orderItems || data.items || [], // Handle legacy data
                        timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : (data.timestamp ? new Date(data.timestamp) : new Date()),
                        totalAmount: data.totalAmount || data.subtotal || 0,
                    };
                });

                // Process sales data by date
                const salesByDate = processSalesByDate(orders, timeRange);
                setSalesData(salesByDate);

                // Process top products
                const topProductsData = processTopProducts(orders);
                setTopProducts(topProductsData);

                // Process category sales
                const categorySalesData = processCategorySales(orders);
                setCategorySales(categorySalesData);

                // Process peak hours (only for today and week)
                if (timeRange === 'today' || timeRange === 'week') {
                    const peakHoursData = processPeakHours(orders);
                    setPeakHours(peakHoursData);
                }
            } catch (error) {
                console.error('Error fetching sales data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSalesData();
    }, [timeRange]);

    return { salesData, topProducts, categorySales, peakHours, isLoading };
};

// Helper functions
function getDateRange(timeRange: TimeRange) {
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (timeRange) {
        case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
        case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);
            break;
        case 'year':
            startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    return { startDate, endDate };
}

function processSalesByDate(orders: any[], timeRange: TimeRange): SalesDataPoint[] {
    const salesMap = new Map<string, { revenue: number; orders: number }>();

    orders.forEach(order => {
        const timestamp = order.timestamp?.toDate ? order.timestamp.toDate() : new Date(order.timestamp);
        let dateKey: string;

        switch (timeRange) {
            case 'today':
                // Group by hour
                dateKey = `${timestamp.getHours()}:00`;
                break;
            case 'week':
                // Group by day
                dateKey = timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                break;
            case 'month':
                // Group by day
                dateKey = timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                break;
            case 'year':
                // Group by month
                dateKey = timestamp.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                break;
            default:
                dateKey = timestamp.toLocaleDateString();
        }

        const existing = salesMap.get(dateKey) || { revenue: 0, orders: 0 };
        salesMap.set(dateKey, {
            revenue: existing.revenue + (order.totalAmount || 0),
            orders: existing.orders + 1
        });
    });

    return Array.from(salesMap.entries())
        .map(([date, data]) => ({
            date,
            revenue: data.revenue,
            orders: data.orders,
            averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0
        }))
        .sort((a, b) => {
            // Sort by date
            if (timeRange === 'today') {
                return parseInt(a.date) - parseInt(b.date);
            }
            return 0; // Already in correct order for other ranges
        });
}

function processTopProducts(orders: any[]): TopProduct[] {
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();

    orders.forEach(order => {
        order.orderItems?.forEach((item: any) => {
            const existing = productMap.get(item.productId) || {
                name: item.productName,
                quantity: 0,
                revenue: 0
            };
            productMap.set(item.productId, {
                name: item.productName,
                quantity: existing.quantity + item.quantity,
                revenue: existing.revenue + (item.price * item.quantity)
            });
        });
    });

    return Array.from(productMap.entries())
        .map(([productId, data]) => ({
            productId,
            productName: data.name,
            quantity: data.quantity,
            revenue: data.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10); // Top 10 products
}

function processCategorySales(orders: any[]): CategorySales[] {
    const categoryMap = new Map<string, { revenue: number; orders: Set<string> }>();

    orders.forEach(order => {
        order.orderItems?.forEach((item: any) => {
            // You might want to fetch product category from products collection
            // For now, we'll extract from product name or use a default
            const category = extractCategory(item.productName);
            const existing = categoryMap.get(category) || { revenue: 0, orders: new Set() };
            categoryMap.set(category, {
                revenue: existing.revenue + (item.price * item.quantity),
                orders: existing.orders.add(order.id)
            });
        });
    });

    return Array.from(categoryMap.entries())
        .map(([category, data]) => ({
            category,
            revenue: data.revenue,
            orders: data.orders.size
        }))
        .sort((a, b) => b.revenue - a.revenue);
}

function processPeakHours(orders: any[]): PeakHour[] {
    const hourMap = new Map<number, { orders: number; revenue: number }>();

    // Initialize all hours
    for (let i = 0; i < 24; i++) {
        hourMap.set(i, { orders: 0, revenue: 0 });
    }

    orders.forEach(order => {
        const timestamp = order.timestamp?.toDate ? order.timestamp.toDate() : new Date(order.timestamp);
        const hour = timestamp.getHours();
        const existing = hourMap.get(hour) || { orders: 0, revenue: 0 };
        hourMap.set(hour, {
            orders: existing.orders + 1,
            revenue: existing.revenue + (order.totalAmount || 0)
        });
    });

    return Array.from(hourMap.entries())
        .map(([hour, data]) => ({
            hour,
            orders: data.orders,
            revenue: data.revenue
        }))
        .filter(data => data.orders > 0); // Only show hours with orders
}

function extractCategory(productName: string): string {
    const lowerName = productName.toLowerCase();
    if (lowerName.includes('latte') || lowerName.includes('espresso') || lowerName.includes('cappuccino') || lowerName.includes('mocha')) {
        return 'Coffee Based';
    } else if (lowerName.includes('matcha')) {
        return 'Matcha Series';
    } else if (lowerName.includes('chocolate') || lowerName.includes('milk')) {
        return 'Non-Coffee Based';
    } else if (lowerName.includes('tea') || lowerName.includes('lemon') || lowerName.includes('soda')) {
        return 'Refreshments';
    } else if (lowerName.includes('waffle') || lowerName.includes('pasta') || lowerName.includes('sandwich')) {
        return 'Meals';
    }
    return 'Other';
}
