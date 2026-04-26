import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../lib/api';

export const SocketContext = createContext();

export const usePurchaseEvents = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [activeUsers, setActiveUsers] = useState(1);
  const [presenceMap, setPresenceMap] = useState({});
  const [latestPurchase, setLatestPurchase] = useState(null);
  const [purchaseEvents, setPurchaseEvents] = useState([]);

  useEffect(() => {
    // Attempt continuous fallback polling on failed WS
    const newSocket = io(API_BASE_URL, {
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    setSocket(newSocket);

    newSocket.on('active_users_update', (count) => {
      setActiveUsers(count);
    });

    newSocket.on('presence_map_update', (map) => {
      setPresenceMap(map);
    });

    newSocket.on('LIVE_PURCHASE', (purchase) => {
      setLatestPurchase(purchase);
      setPurchaseEvents((prev) => [...prev.slice(-9), purchase]);
    });

    const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : null;
    const userId = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo'))._id : null;
    
    if (userId) {
       newSocket.emit('register_session', userId);
    }
    if (token) {
       newSocket.emit('authenticate_admin', token);
    }

    return () => newSocket.close();
  }, []);

  const value = useMemo(() => ({
    socket,
    activeUsers,
    presenceMap,
    latestPurchase,
    purchaseEvents,
  }), [socket, activeUsers, presenceMap, latestPurchase, purchaseEvents]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
