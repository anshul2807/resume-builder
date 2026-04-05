import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { BASE_URL } from '../config/api';

// ─── Context ─────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

/**
 * Auth context with backend-driven AI usage tracking.
 *
 * Token usage is fetched from the backend via GET /api/ai/usage
 */
export const AuthProvider = ({ children }) => {
    // ── Session state ──────────────────────────────────────────────────────
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('d2p-session');
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });

    // token is kept separately so we never accidentally serialise it into logs
    const [token, setToken] = useState(() => localStorage.getItem('d2p-token') || null);

    // ── Backend-driven usage state ─────────────────────────────────────────
    const [tokens, setTokens] = useState(0);

    // ── Fetch usage from backend ───────────────────────────────────────────
    /**
     * GET /api/ai/usage
     * Expected response: { tokens: number }
     */
    const fetchUsage = useCallback(async (jwtToken) => {
        const tkn = jwtToken || token;
        if (!tkn) return;

        try {
            const res = await fetch(`${BASE_URL}/api/ai/usage`, {
                headers: { Authorization: `Bearer ${tkn}` },
            });
            if (!res.ok) return; // non-critical — fall back to current state
            const data = await res.json();
            if (typeof data.tokens === 'number') {
                setTokens(data.tokens);
            }
        } catch {
            /* network error — keep current values */
        }
    }, [token]);

    // Fetch usage on mount (when already logged in) and whenever token changes
    useEffect(() => {
        if (token) fetchUsage(token);
    }, [token, fetchUsage]);

    // ── Auth helpers ───────────────────────────────────────────────────────
    const persistSession = (userData, jwtToken) => {
        setUser(userData);
        setToken(jwtToken);
        try {
            localStorage.setItem('d2p-session', JSON.stringify(userData));
            localStorage.setItem('d2p-token', jwtToken);
        } catch { /* quota edge-case — ignore */ }
    };

    const clearSession = () => {
        setUser(null);
        setToken(null);
        setTokens(0);
        localStorage.removeItem('d2p-session');
        localStorage.removeItem('d2p-token');
    };

    /**
     * Sign up — POST /api/auth/signup
     * Returns { user, token } on success; throws Error on failure.
     */
    const signup = useCallback(async (email, password, name) => {
        const res = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Signup failed. Please try again.');
        persistSession(data.user, data.token);
        // Fetch usage right after signup
        fetchUsage(data.token);
        return data;
    }, []);

    /**
     * Login — POST /api/auth/login
     * Returns { user, token } on success; throws Error on failure.
     */
    const login = useCallback(async (email, password) => {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Login failed. Check your credentials.');
        console.log(data.user);
        persistSession(data.user, data.token);
        // Fetch usage right after login
        fetchUsage(data.token);
        return data;
    }, []);

    /** Logout — clears local session (optionally POST /api/auth/logout). */
    const logout = useCallback(() => {
        // Fire-and-forget backend logout if your backend supports it
        if (token) {
            fetch(`${BASE_URL}/api/auth/logout`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            }).catch(() => { /* non-critical */ });
        }
        clearSession();
    }, [token]);

    // ── Decrement tokens (called after a successful operation) ────────────────
    /**
     * Optimistically decrements the local counter, then refreshes from backend.
     */
    const decrementTokens = useCallback((amount = 1) => {
        // Optimistic local update
        setTokens((prev) => Math.max(0, prev - amount));
        // Then sync with backend to get the real count
        fetchUsage();
    }, [fetchUsage]);

    /**
     * Manually refresh usage from backend.
     * Useful for components that want to force a re-sync.
     */
    const refreshUsage = useCallback(() => {
        return fetchUsage();
    }, [fetchUsage]);

    // ── Derived ────────────────────────────────────────────────────────────

    const isLoggedIn = Boolean(user && token);
    const isAdmin = isLoggedIn && user?.role === 'admin';

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoggedIn,
                isAdmin,
                login,
                signup,
                logout,
                // API token balance - now from backend
                tokens,
                hasEnhanceTokens: tokens >= 1,
                decrementTokens,
                refreshUsage,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
    return ctx;
};
