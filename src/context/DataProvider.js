/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useState, useEffect } from 'react';
import { FirebaseService } from '../service/firebase';
import {
    collections,
    types_docs,
    sub_collections,
    orderx_docs,
    defaultIdState,
    paypal,
    calculateExtraPoint,
    orders_docs
} from '../constant/firebase';

export const DataContext = createContext(null);
export const DataProvider = ({ children }) => {
    const [store, setStore] = useState({
        products: [],
        productCategories: [],
        cart: [],
        paymentMethod: [],
        orderStates: [],
        membership: null,
        myProcessingOrders: null,
        myProcessedOrders: null,
        isLoggedIn: false,
        timeStore: {},
        rewards: []
        //deep clone / shallow clone
    });

    // fetch init Data
    useEffect(() => {
        // fetch products
        const refProduct = FirebaseService.db.collection(collections.products).where('isDeleted', '==', false);
        refProduct.get().then((querySnapshot) => {
            let newProducts = [];
            querySnapshot.forEach((doc) => {
                newProducts.push(doc.data());
            });
            setStore((store) => ({
                ...store,
                products: newProducts
            }));
        });
        // fetch category products
        const refCategory = FirebaseService.db
            .collection(collections.types)
            .doc(types_docs.product_category)
            .collection(sub_collections.types)
            .where('isDeleted', '==', false);
        refCategory.get().then((querySnapshot) => {
            let newProductsCate = [];
            querySnapshot.forEach((doc) => {
                newProductsCate.push(doc.data());
            });
            setStore((store) => ({
                ...store,
                productCategories: newProductsCate
            }));
        });

        // fetch payment method
        const refPaymentMethod = FirebaseService.db
            .collection(collections.types)
            .doc(types_docs.payment_method)
            .collection(sub_collections.types);
        refPaymentMethod.get().then((querySnapshot) => {
            let typePaymentMethod = [];
            querySnapshot.forEach((doc) => {
                typePaymentMethod.push(doc.data());
            });
            setStore((store) => ({
                ...store,
                paymentMethod: typePaymentMethod
            }));
        });

        // fetch ordet states
        const refOrderState = FirebaseService.db
            .collection(collections.types)
            .doc(types_docs.order_state)
            .collection(sub_collections.types);
        refOrderState.get().then((querySnapshot) => {
            let typeOrdetState = [];
            querySnapshot.forEach((doc) => {
                typeOrdetState.push(doc.data());
            });
            setStore((store) => ({
                ...store,
                orderStates: typeOrdetState
            }));
        });
    }, []);
    // fetch rewards
    useEffect(() => {
        if (store.membership !== null) {
            const refReward = FirebaseService.db
                .collection(collections.rewards)
                .doc(store.membership.id)
                .collection('my_rewards')
                .where('used', '==', false)
                .where('expiryDate', '>=', Date.now());

            refReward.get().then((querySnapshots) => {
                let rewards = [];
                querySnapshots.docs.forEach(doc => {
                    if (doc.data().createAt <= Date.now()) {
                        rewards.push(doc.data())
                    }
                })
                setStore(store => ({
                    ...store,
                    rewards
                }));
            });
        }
    },
        [store.membership]
    );

    // update cart for membership at db
    useEffect(
        () => {
            // handle debounce
            const timeout = setTimeout(() => {
                if (store.isLoggedIn === true && store.membership.id !== undefined) {
                    const cartDoc = FirebaseService.db.collection(collections.carts).doc(store.membership.id);
                    cartDoc.update({
                        cart: store.cart,
                        updateAt: new Date()
                    });
                }
            }, 3000);
            return () => clearTimeout(timeout);
        },
        [store.isLoggedIn, store.cart]
    );
    // connect realtime to update membetship
    useEffect(
        () => {
            if (store.isLoggedIn === true) {
                const membershipDoc = FirebaseService.db.collection(collections.membership).doc(store.membership.id);
                membershipDoc.onSnapshot((doc) => {
                    const membership = doc.data();
                    setStore((store) => ({
                        ...store,
                        membership: {
                            ...membership,
                            updateAt: membership.updateAt.toDate(),
                            createAt: membership.createAt.toDate(),
                            birthday: membership.birthday.toDate()
                            
                        }
                    }));
                });
            }
        }, [store.isLoggedIn]
    );
    // connect reatime to update myOrders of membership
    useEffect(
        () => {
            let processingOrderCol, processedOrderCol;
            if (store.isLoggedIn === true) {
                // handle for processing
                processingOrderCol = FirebaseService.db
                    .collection(collections.orders)
                    .doc(orderx_docs.processing)
                    .collection(sub_collections.processing)
                    .where('idMembership', '==', store.membership.id).onSnapshot((querySnapshot) => {
                        let newMyProcessingOrders = querySnapshot.docs.map((doc) => {
                            let order = {
                                ...doc.data(),
                                updateAt: doc.data().updateAt.toDate(),
                                createAt: doc.data().createAt.toDate()
                            };
                            if (order.paidAt !== undefined) order.paidAt = order.paidAt.toDate();
                            return order;
                        });
                        setStore((store) => ({
                            ...store,
                            myProcessingOrders: [...newMyProcessingOrders]
                        }));
                        console.log(newMyProcessingOrders)
                    });
                // handle for processed
                processedOrderCol = FirebaseService.db
                    .collection(collections.orders)
                    .doc(orderx_docs.processed)
                    .collection(sub_collections.processing)
                    .where('idMembership', '==', store.membership.id).onSnapshot((querySnapshot) => {
                        let newMyProcessedOrders = querySnapshot.docs.map((doc) => {
                            let order = {
                                ...doc.data(),
                                updateAt: doc.data().updateAt.toDate(),
                                createAt: doc.data().createAt.toDate()
                            };
                            if (order.paidAt !== undefined) order.paidAt = order.paidAt.toDate();
                            return order;
                        });
                        setStore((store) => ({
                            ...store,
                            myProcessedOrders: [...newMyProcessedOrders]
                        }));
                        console.log(newMyProcessedOrders)
                    });

            }
            return () => {
                if (store.isLoggedIn === true) {
                    // unsubscribe
                    processingOrderCol()
                    processedOrderCol();
                    // console.log('clear')
                }
            };
        },
        [store.isLoggedIn, store.membership === null ? 1 : store.membership.id]
    );
    // connect realtime to update close and open store
    useEffect(() => {
        const timeStoreDoc = FirebaseService.db.collection(collections.orders).doc(orders_docs.processing);
        timeStoreDoc.onSnapshot((doc) => {
            const timeStore = doc.data();
            // console.log('timestore: ', timeStore)
            setStore((store) => ({
                ...store,
                timeStore: {
                    ...timeStore
                }
            }));
        });
    }, []);

    //handle order for paymentmethod: cash
    const order = async (receiver, idPaymentMethod, idMembership, discount) => {
        try {
            const paidAt = idPaymentMethod === paypal ? new Date() : undefined;
            const priceTotal = store.cart.reduce((acc, curr) => acc + curr.price * curr.count, 0);
            const processingCol = FirebaseService.db
                .collection(collections.orders)
                .doc(orderx_docs.processing)
                .collection(sub_collections.processing)
                .doc();
            const idOrder = processingCol.id;
            const newOrder = {
                id: idOrder,
                receiverInfo: receiver,
                idPaymentMethod,
                idState: defaultIdState,
                detail: store.cart,
                priceTotal,
                //idMembership,
                //discount,
                //paidAt,
                createAt: new Date(),
                updateAt: new Date()
            };
            if (discount !== undefined) {
                newOrder.discount = discount;
                newOrder.priceTotal = newOrder.priceTotal - discount.value;
            }
            if (paidAt !== undefined) newOrder.paidAt = paidAt;
            if (idMembership !== undefined) newOrder.idMembership = idMembership;
            // add order to DB
            await processingCol.set(newOrder);
            // change info membership
            if (idMembership) {
                const membershipDoc = FirebaseService.db.collection(collections.membership).doc(store.membership.id);
                const point = idPaymentMethod === paypal ? calculateExtraPoint(priceTotal) : undefined;
                const updateMembership = {
                    updateAt: new Date(),
                    orders: FirebaseService.firestore.FieldValue.arrayUnion(idOrder)
                };
                if (point !== undefined) updateMembership.point = FirebaseService.firestore.FieldValue.increment(point);
                // update member ship
                await membershipDoc.update(updateMembership);
            }
            setStore((store) => ({ ...store, cart: [] }));
            return 200;
        } catch (error) {
            debugger
            return 400;
        }
    };
    // handle Sign out 
    const signOut = () => {
        setStore({
            ...store,
            cart: [],
            membership: null,
            myProcessingOrders: null,
            myProcessedOrders: null,
            isLoggedIn: false,
            rewards: []
        })
    }
    // handle Sign in
    const signIn = async (email, password) => {
        try {
            await FirebaseService.signIn(email, password);
            const currUser = FirebaseService.auth.currentUser;
            const membershipDoc = await FirebaseService.db.collection(collections.membership).doc(currUser.uid).get();
            if (membershipDoc.exists) {
                const membership = membershipDoc.data();
                if (membership.isDeleted === true) {
                    return 401; // member is banned
                } else {
                    const cartDoc = await FirebaseService.db.collection(collections.carts).doc(currUser.uid).get();
                    let newCart = cartDoc.data().cart;
                    let positionInvalid = [];
                    // find  product deleted
                    newCart.forEach((item, index) => {
                        const isExit = store.products.findIndex((product) => product.id === item.id);
                        if (isExit === -1) {
                            positionInvalid.push(index);
                        }
                    });
                    // delete product in cart
                    positionInvalid.forEach((position) => {
                        newCart.splice(position, 1);
                    });
                    setStore({
                        ...store,
                        membership: {
                            ...membership,
                            updateAt: membership.updateAt.toDate(),
                            createAt: membership.createAt.toDate(),
                            birthday: membership.birthday.toDate()
                        },
                        isLoggedIn: true,
                        cart: newCart
                    });
                }
            } else {
                return 400; // account is not valid
            }

            return 200; // success
        } catch (error) {
            return 400; // account is not valid
        }
    };
    // manage cart
    const addProduct = (product) => {
        const { id, price } = product;
        const { cart } = store;
        const isIndexExit = cart.findIndex((item) => item.id === id);
        let newCart = cart.slice();
        if (isIndexExit === -1) {
            newCart.push({
                id,
                price,
                count: 1
            });
        } else {
            const newCartItem = {
                ...cart[isIndexExit],
                count: cart[isIndexExit].count + 1
            };
            newCart.splice(isIndexExit, 1, newCartItem);
        }
        setStore({
            ...store,
            cart: newCart
        });
    };
    const updateCountInCart = (id, value) => {
        const { cart } = store;
        const itemIndex = cart.findIndex((item) => item.id === id);
        let newCart = cart.slice();
        let count = cart[itemIndex].count + value;
        if (count > 0) {
            const newCartItem = {
                ...cart[itemIndex],
                count
            };
            newCart.splice(itemIndex, 1, newCartItem);
        } else {
            newCart.splice(itemIndex, 1);
        }
        setStore({
            ...store,
            cart: newCart
        });
    };
    const deleteProcessinOrderAPI = (id) => {
        return  FirebaseService.db
        .collection(collections.orders)
        .doc(orders_docs.processing)
        .collection(sub_collections.types)
        .doc(id).delete()
    }
    const addOrderToProcessedOrder = (order, newIdState) => {
        return FirebaseService.db
        .collection(collections.orders)
        .doc(orderx_docs.processed)
        .collection(sub_collections.types)
        .doc(order.id).set({...order})
    }
    
    useEffect(() => {
        let a = store.myProcessingOrders;
        // debugger
        console.log('...:', a);
    }, [store.myProcessingOrders])
    return (
        <DataContext.Provider
            value={{
                store: {
                    ...store
                },
                action: {
                    product: {},
                    productCategories: {},
                    cart: {
                        addProduct,
                        updateCountInCart
                    },
                    paymentMethod: {},
                    auth: {
                        signIn,
                        signOut
                    },
                    orders: {
                        order,
                        deleteProcessinOrderAPI,
                        addOrderToProcessedOrder
                    }
                }
            }}
        >
            {children}
        </DataContext.Provider>
    );
};
