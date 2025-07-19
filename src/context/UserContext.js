"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import {jwtDecode} from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const router = useRouter();
    const { data: session, status } = useSession();

    // Handle session changes and set user data
    useEffect(() => {
        console.log("UserContext - Session status:", status);
        console.log("UserContext - Session data:", session);
        
        if (status === 'loading') return;

        if (session?.customToken) {
            try {
                const decodedUser = jwtDecode(session.customToken);
                console.log("Google login - decoded user:", decodedUser);
                setUser(decodedUser);
                localStorage.setItem('token', session.customToken);
            } catch (error) {
                console.error('Invalid session token:', error);
                logout();
            }
        } else if (session?.user) {
            // Fallback for session without customToken
            const userData = {
                userId: session.user.id,
                _id: session.user._id,
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
                provider: session.user.provider,
            };
            console.log("Google login - session user:", userData);
            setUser(userData);
        } else {
            // Check for existing JWT token (for regular login)
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decodedUser = jwtDecode(token);
                    console.log("JWT token - decoded user:", decodedUser);
                    setUser(decodedUser);
                } catch (error) {
                    console.error('Invalid token:', error);
                    logout();
                }
            } else {
                console.log("No session or token found - setting user to null");
                setUser(null);
            }
        }
    }, [session, status]);

    // Login function for regular JWT login
    const login = (token) => {
        localStorage.setItem('token', token);
        const decodedUser = jwtDecode(token);
        console.log("Regular login - decoded user:", decodedUser);
        setUser(decodedUser);
        router.push('/');
    };

    // Set session manually (if needed)
    const setSession = (session) => {
        if (session?.customToken) {
            try {
                const decodedUser = jwtDecode(session.customToken);
                localStorage.setItem('token', session.customToken);
                console.log("Manual session set - decoded user:", decodedUser);
                setUser(decodedUser);
            } catch (error) {
                console.error('Invalid session token:', error);
            }
        }
    }

    // Logout function
    const logout = async () => {
        localStorage.removeItem('token');
        setUser(null);
        
        if (session) {
            await signOut({ callbackUrl: '/signin' });
        } else {
            router.push('/signin');
        }
    };

    return (
        <UserContext.Provider value={{ user, login, logout, setSession }}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook for easy access
export const useUser = () => useContext(UserContext);
