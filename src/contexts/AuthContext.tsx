import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface SubscriptionStatus {
  subscribed: boolean;
  product_id?: string | null;
  subscription_end?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  subscription: SubscriptionStatus | null;
  loading: boolean;
  onboardingCompleted: boolean | null;
  signUp: (email: string, password: string, phone: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  checkOnboardingStatus: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  createCheckoutSession: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkSubscription = async () => {
    if (!session) {
      setSubscription({ subscribed: false });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription({ subscribed: false });
    }
  };

  const checkOnboardingStatus = async () => {
    if (!user) {
      setOnboardingCompleted(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setOnboardingCompleted(data?.onboarding_completed ?? false);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setOnboardingCompleted(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);

      if (error) throw error;
      setOnboardingCompleted(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer subscription and onboarding checks
        if (session?.user) {
          setTimeout(() => {
            checkSubscription();
            checkOnboardingStatus();
          }, 0);
        } else {
          setSubscription({ subscribed: false });
          setOnboardingCompleted(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          checkSubscription();
          checkOnboardingStatus();
        }, 0);
      }
      setLoading(false);
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, phone: string) => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            phone: phone,
          }
        }
      });

      if (error) throw error;

      // Insert phone number into private data table (owner-only access)
      if (data.user && phone) {
        const { error: privateDataError } = await supabase
          .from('user_private_data')
          .insert({ 
            id: data.user.id, 
            phone: phone 
          });

        if (privateDataError) console.error('Error saving private data:', privateDataError);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSubscription({ subscribed: false });
    navigate('/');
  };

  const createCheckoutSession = async () => {
    if (!session) {
      throw new Error('User must be logged in');
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  };

  const openCustomerPortal = async () => {
    if (!session) {
      throw new Error('User must be logged in');
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    subscription,
    loading,
    onboardingCompleted,
    signUp,
    signIn,
    signOut,
    checkSubscription,
    checkOnboardingStatus,
    completeOnboarding,
    createCheckoutSession,
    openCustomerPortal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
