
'use server';

import { collection, getDocs, addDoc, query, orderBy, doc, runTransaction, getDoc, setDoc, updateDoc, deleteDoc, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Order, Product, OrderItem, OrderInput } from '@/types';
import { revalidatePath } from 'next/cache';
import { getShippingOptions } from './shipping-service';

const ordersCollection = collection(db, 'orders');
const productsCollection = collection(db, 'products');
const counterDocRef = doc(db, 'counters', 'orders');

async function getNextOrderNumber(): Promise<number> {
    try {
        const orderNumber = await runTransaction(db, async (transaction) => {
            const counterDoc = await transaction.get(counterDocRef);
            
            if (!counterDoc.exists()) {
                transaction.set(counterDocRef, { currentNumber: 1 });
                return 1;
            }
            
            const newNumber = counterDoc.data().currentNumber + 1;
            transaction.update(counterDocRef, { currentNumber: newNumber });
            return newNumber;
        });
        return orderNumber;
    } catch (e) {
        console.error("Transaction failed: ", e);
        throw new Error("Could not generate a new order number.");
    }
}


export async function getOrders(): Promise<Order[]> {
    const q = query(ordersCollection, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    return orders;
}

export async function addOrder(orderInput: OrderInput) {
    const orderNumber = await getNextOrderNumber();
    
    try {
        await runTransaction(db, async (transaction) => {
            const finalOrderItems: OrderItem[] = [];
            let calculatedSubtotal = 0;

            // Fetch all products required for the order in parallel
            const productRefs = orderInput.items.map(item => doc(db, 'products', item.productId));
            const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

            for (let i = 0; i < orderInput.items.length; i++) {
                const item = orderInput.items[i];
                const productDoc = productDocs[i];

                if (!productDoc.exists()) {
                    throw new Error(`Product with ID ${item.productId} does not exist.`);
                }
                
                const productData = { id: productDoc.id, ...productDoc.data() } as Product;
                
                if (productData.quantity < item.quantity) {
                    throw new Error(`Not enough stock for ${productData.name}. Requested: ${item.quantity}, Available: ${productData.quantity}`);
                }

                const newQuantity = productData.quantity - item.quantity;
                transaction.update(productRefs[i], { quantity: newQuantity });
                
                calculatedSubtotal += productData.price * item.quantity;

                finalOrderItems.push({
                    product: productData,
                    quantity: item.quantity,
                    selectedColor: item.selectedColor,
                    selectedFlavor: item.selectedFlavor,
                    selectedSize: item.selectedSize
                });
            }

            // Calculate shipping
            const shippingOptions = await getShippingOptions();
            const stateData = shippingOptions.find(s => s.state === orderInput.shippingAddress.state);
            const cityData = stateData?.cities.find(c => c.name === orderInput.shippingAddress.city);
            const shippingPrice = cityData?.price || 0;

            // Calculate final amount on the server
            const discountAmount = orderInput.promoCode?.discountAmount || 0;
            const finalAmount = calculatedSubtotal - discountAmount + shippingPrice;

            const newOrderData: Omit<Order, 'id'> = {
                customer: orderInput.customer,
                shippingAddress: orderInput.shippingAddress,
                promoCode: orderInput.promoCode,
                items: finalOrderItems,
                amount: finalAmount,
                orderNumber,
                date: new Date().toISOString(),
                status: 'pending',
            };

            const newOrderRef = doc(collection(db, 'orders'));
            transaction.set(newOrderRef, newOrderData);
        });
        
        revalidatePath('/');
        revalidatePath('/cart');
        revalidatePath('/admin/orders');
        revalidatePath('/admin/products');
        revalidatePath('/admin/finance');
        return { success: true };

    } catch (error) {
        console.error("Error adding order and updating stock: ", error);
        return { success: false, error: (error as Error).message };
    }
}


export async function getTotalRevenue(): Promise<number> {
    const q = query(ordersCollection, where('status', '==', 'delivered'));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => doc.data() as Order);
    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
    return totalRevenue;
}

export async function getTotalCostOfGoodsSold(): Promise<number> {
    const q = query(ordersCollection, where('status', '==', 'delivered'));
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => doc.data() as Order);
    
    const totalCOGS = orders.reduce((totalSum, order) => {
        const orderCOGS = order.items.reduce((orderSum, item) => {
            const buyingPrice = item.product.buyingPrice || 0;
            return orderSum + (buyingPrice * item.quantity);
        }, 0);
        return totalSum + orderCOGS;
    }, 0);

    return totalCOGS;
}

export async function updateOrderStatus(id: string, status: Order['status']) {
    try {
        const docRef = doc(db, 'orders', id);
        await updateDoc(docRef, { status });
        revalidatePath('/admin/orders');
        revalidatePath('/admin/finance');
        revalidatePath('/admin/customers');
        return { success: true };
    } catch (error) {
        console.error("Error updating order status: ", error);
        return { success: false, error: (error as Error).message };
    }
}

export async function deleteOrder(id: string) {
    try {
        const docRef = doc(db, 'orders', id);
        await deleteDoc(docRef);
        revalidatePath('/admin/orders');
        revalidatePath('/admin/finance');
        revalidatePath('/admin/customers');
        return { success: true };
    } catch (error) {
        console.error("Error deleting order: ", error);
        return { success: false, error: (error as Error).message };
    }
}
