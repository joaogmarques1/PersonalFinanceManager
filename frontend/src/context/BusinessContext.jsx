import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosClient from "../api/axiosClient";
import { fetchUserBusinesses as fetchUserBusinessesApi } from '../features/business/api';

const BusinessContext = createContext();

export const useBusiness = () => useContext(BusinessContext);

export const BusinessProvider = ({ children, user }) => {
    const [environment, setEnvironment] = useState(() => sessionStorage.getItem('app_environment') || 'personal');
    const [activeBusiness, setActiveBusiness] = useState(() => {
        const saved = sessionStorage.getItem('active_business');
        return saved ? JSON.parse(saved) : null;
    });
    const [userBusinesses, setUserBusinesses] = useState([]);
    const [loading, setLoading] = useState(false);

    // Persist environment
    useEffect(() => {
        sessionStorage.setItem('app_environment', environment);
    }, [environment]);

    // Persist activeBusiness
    useEffect(() => {
        if (activeBusiness) {
            sessionStorage.setItem('active_business', JSON.stringify(activeBusiness));
        } else {
            sessionStorage.removeItem('active_business');
        }
    }, [activeBusiness]);

    // Switch between Personal and Business modes
    const switchEnvironment = (env) => {
        setEnvironment(env);
        if (env === 'personal') {
            setActiveBusiness(null);
        } else if (env === 'business' && userBusinesses.length > 0 && !activeBusiness) {
            // Auto-select first business if none selected
            setActiveBusiness(userBusinesses[0]);
        }
    };

    // ... (inside BusinessProvider in previous file content, need imports first)

    const fetchUserBusinesses = async () => {
        setLoading(true);
        try {
            const data = await fetchUserBusinessesApi();
            setUserBusinesses(data);

        } catch (error) {
            console.error("Failed to fetch businesses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token && user) {
            fetchUserBusinesses();
        } else if (!user) {
            // 🔄 Reset internal state when user is cleared
            setEnvironment('personal');
            setActiveBusiness(null);
        }
    }, [user]);

    return (
        <BusinessContext.Provider
            value={{
                environment,
                switchEnvironment,
                activeBusiness,
                setActiveBusiness,
                userBusinesses,
                fetchUserBusinesses,
                loading
            }}
        >
            {children}
        </BusinessContext.Provider>
    );
};
