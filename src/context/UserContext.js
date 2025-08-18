"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authError, setAuthError] = useState(null);
    const router = useRouter();
    const { data: session, status } = useSession();

    const validateAndDecodeToken = (token) => {
        console.log('[Auth] Validating token:', token ? 'Received' : 'Missing');
        
        if (!token) {
            throw new Error('Authentication token is required');
        }

        if (typeof token !== 'string') {
            throw new Error(`Token must be a string, got ${typeof token}`);
        }

        token = token.trim();
        if (token.length === 0) {
            throw new Error('Token cannot be empty');
        }

        try {
            const decoded = jwtDecode(token);
            console.log('[Auth] Token validated successfully');
            return decoded;
        } catch (error) {
            console.error('[Auth] Token decode error:', error);
            throw new Error('Invalid authentication token');
        }
    };

    // Handle session changes
    useEffect(() => {
        const handleAuth = async () => {
            try {
                setAuthError(null);
                
                if (status === 'loading') return;

                if (session?.customToken) {
                    console.log('[Auth] Processing customToken from session');
                    const decodedUser = validateAndDecodeToken(session.customToken);
                    setUser(decodedUser);
                    localStorage.setItem('token', session.customToken);
                } else if (session?.user) {
                    console.log('[Auth] Processing standard session user');
                    setUser({
                        userId: session.user.id,
                        _id: session.user._id,
                        name: session.user.name,
                        email: session.user.email,
                        image: session.user.image,
                        provider: session.user.provider
                    });
                } else {
                    console.log('[Auth] Checking localStorage for token');
                    const token = localStorage.getItem('token');
                    if (token) {
                        const decodedUser = validateAndDecodeToken(token);
                        setUser(decodedUser);
                    } else {
                        console.log('[Auth] No valid session or token found');
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('[Auth] Error:', error);
                setAuthError(error.message);
                await logout();
            }
        };

        handleAuth();
    }, [session, status]);

    const login = async (token) => {
        try {
            console.log('[Auth] Login attempt with token');
            if (!token) {
                throw new Error('No token provided for login');
            }
            
            const decodedUser = validateAndDecodeToken(token);
            localStorage.setItem('token', token);
            setUser(decodedUser);
            router.push('/dashboard');
            return { success: true };
        } catch (error) {
            console.error('[Auth] Login failed:', error);
            setAuthError(error.message);
            throw error; // Re-throw to allow handling in the calling component
        }
    };

    const logout = async () => {
        console.log('[Logout] Initiating logout');
        localStorage.removeItem('token');
        setUser(null);
        setAuthError(null);
        
        try {
            if (session) {
                await signOut({ redirect: false });
            }
            router.push('/signin');
        } catch (error) {
            console.error('[Logout] Error:', error);
            router.push('/signin');
        }
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            login, 
            logout, 
            authError,
            setAuthError 
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);