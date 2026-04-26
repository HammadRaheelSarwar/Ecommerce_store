import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const items = localStorage.getItem('cartItems');
      return items ? JSON.parse(items) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    setCartItems(prev => {
      const productId = product._id || product.id;
      const existItem = prev.find(x => (x._id || x.id) === productId);
      if (existItem) {
        return prev.map(x => (x._id || x.id) === productId ? { ...product, qty: existItem.qty + qty } : x);
      } else {
        return [...prev, { ...product, qty }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(x => (x._id || x.id) !== id));
  };

  const increaseQuantity = (id) => {
    setCartItems(prev => prev.map(x => {
      const itemId = x._id || x.id;
      return itemId === id ? { ...x, qty: x.qty + 1 } : x;
    }));
  };

  const decreaseQuantity = (id) => {
    setCartItems(prev => prev.map(x => {
      const itemId = x._id || x.id;
      if (itemId === id) {
        const newQty = x.qty - 1;
        return { ...x, qty: newQty > 0 ? newQty : 1 };
      }
      return x;
    }));
  };

  const clearCart = () => setCartItems([]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};
