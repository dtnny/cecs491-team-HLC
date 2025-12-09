"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabaseBrowser as supabase } from "@/lib/supabase-browser";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);

  //
  // Load initial session on mount and listen for auth changes
  //
  useEffect(() => {
    let mounted = true;
    let authSubscription = null;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setUser(data?.session?.user ?? null);
        setLoading(false);
      }

      //
      // Listen for auth changes (handles all auth state changes including tab visibility)
      //
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        // Don't reset loading - it should only be false after initial load
      });

      authSubscription = subscription;
    };

    init();
    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);



  // Block navigation when reconnecting
  useEffect(() => {
    if (reconnecting) {
      // Prevent navigation by intercepting link clicks
      const handleClick = (e) => {
        const target = e.target.closest('a');
        if (target && target.href && !target.href.startsWith('mailto:') && !target.href.startsWith('tel:')) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      // Prevent browser back/forward
      const handlePopState = (e) => {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
      };

      window.history.pushState(null, '', window.location.href);
      document.addEventListener('click', handleClick, true);
      window.addEventListener('popstate', handlePopState);

      return () => {
        document.removeEventListener('click', handleClick, true);
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [reconnecting]);

  return (
    <AuthContext.Provider value={{ user, loading, reconnecting, setReconnecting }}>
      {children}
      {reconnecting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 text-center shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-900">Refreshing the connection...</p>
            <p className="text-sm text-gray-600 mt-2">Please wait while we reconnect to the server.</p>
            <p className="text-xs text-gray-500 mt-3">Navigation is temporarily disabled.</p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
