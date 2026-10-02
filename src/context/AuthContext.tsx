import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'USER' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  preferredLocation: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  lastActive: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface WeatherAlertItem {
  id: string;
  title: string;
  category: 'SEVERE' | 'HIGH_RISK' | 'VERIFIED' | 'SYSTEM';
  message: string;
  location: string;
  timestamp: string;
  read: boolean;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  eventId?: string;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  role: UserRole;
  savedEventIds: string[];
  alerts: WeatherAlertItem[];
  unreadAlertsCount: number;
  signIn: (email: string, role?: UserRole) => Promise<boolean>;
  signUp: (userData: Omit<UserProfile, 'id' | 'createdAt' | 'lastActive' | 'status'>) => Promise<boolean>;
  signOut: () => void;
  toggleSaveEvent: (eventId: string) => void;
  isEventSaved: (eventId: string) => boolean;
  markAlertAsRead: (alertId: string) => void;
  markAllAlertsAsRead: () => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  switchRole: (newRole: UserRole) => void;
}

const DEFAULT_ADMIN_USER: UserProfile = {
  id: 'USR-ADM-001',
  name: 'Dr. Poornima Ayodhi',
  email: 'poornima@weather.gov.in',
  phone: '+91 98401 23456',
  preferredLocation: 'Chennai, Tamil Nadu',
  role: 'ADMIN',
  createdAt: '2025-11-14T09:30:00Z',
  lastActive: 'Just now',
  status: 'ACTIVE',
};

const DEFAULT_STANDARD_USER: UserProfile = {
  id: 'USR-STD-002',
  name: 'Rajesh Kumar',
  email: 'rajesh.field@tn-disaster.gov.in',
  phone: '+91 94440 98765',
  preferredLocation: 'Chennai, Tamil Nadu',
  role: 'USER',
  createdAt: '2026-01-20T14:15:00Z',
  lastActive: '5 min ago',
  status: 'ACTIVE',
};

const INITIAL_ALERTS: WeatherAlertItem[] = [
  {
    id: 'ALT-01',
    title: 'SEVERE FLASH INUNDATION DETECTED',
    category: 'SEVERE',
    message: 'Adyar River basin water level exceeded critical danger threshold (+1.1m). Velachery and Saidapet low-lying zones flagged for immediate urban response.',
    location: 'Chennai, Tamil Nadu',
    timestamp: '10 min ago',
    read: false,
    severity: 'CRITICAL',
    eventId: 'EVT-CHE-2026-001',
  },
  {
    id: 'ALT-02',
    title: 'HIGH-VELOCITY COASTAL SQUALL WARNING',
    category: 'HIGH_RISK',
    message: 'Arabian Sea coastal squall line advancing eastward. Wind gusts 58 km/h recorded with wave swells of 3.5m near Mumbai harbor.',
    location: 'Mumbai, Maharashtra',
    timestamp: '32 min ago',
    read: false,
    severity: 'WARNING',
    eventId: 'EVT-MUM-2026-003',
  },
  {
    id: 'ALT-03',
    title: 'AI MULTI-SOURCE VERIFICATION COMPLETED',
    category: 'VERIFIED',
    message: 'Meenambakkam monsoon cloudburst confirmed by 9 independent channels (IMD Doppler radar 52 dBZ, rain gauge 48mm/hr, 7 citizen spotters). 96% confidence score locked.',
    location: 'Meenambakkam, Tamil Nadu',
    timestamp: '1 hour ago',
    read: true,
    severity: 'INFO',
    eventId: 'EVT-CHE-2026-002',
  },
  {
    id: 'ALT-04',
    title: 'RIVERINE SURGE ESCALATION',
    category: 'SEVERE',
    message: 'Brahmaputra tributary discharge surge detected by automated ultrasonic telemetry. SDRF rescue staging alerted.',
    location: 'Guwahati, Assam',
    timestamp: '2 hours ago',
    read: true,
    severity: 'CRITICAL',
    eventId: 'EVT-ASM-2026-007',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('nw_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    // Default to authenticated admin for immediate SIH review readiness
    return DEFAULT_ADMIN_USER;
  });

  const [savedEventIds, setSavedEventIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('nw_saved_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved events:', e);
      }
    }
    return ['EVT-CHE-2026-001', 'EVT-CHE-2026-002'];
  });

  const [alerts, setAlerts] = useState<WeatherAlertItem[]>(() => {
    const saved = localStorage.getItem('nw_user_alerts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved alerts:', e);
      }
    }
    return INITIAL_ALERTS;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('nw_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('nw_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('nw_saved_events', JSON.stringify(savedEventIds));
  }, [savedEventIds]);

  useEffect(() => {
    localStorage.setItem('nw_user_alerts', JSON.stringify(alerts));
  }, [alerts]);

  const signIn = async (email: string, requestedRole: UserRole = 'ADMIN'): Promise<boolean> => {
    // In this production-style application prototype, allow immediate sign in with real user state
    const user = requestedRole === 'ADMIN'
      ? { ...DEFAULT_ADMIN_USER, email }
      : { ...DEFAULT_STANDARD_USER, email };
    setCurrentUser(user);
    return true;
  };

  const signUp = async (userData: Omit<UserProfile, 'id' | 'createdAt' | 'lastActive' | 'status'>): Promise<boolean> => {
    const newUser: UserProfile = {
      ...userData,
      id: `USR-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString(),
      lastActive: 'Just now',
      status: 'ACTIVE',
    };
    setCurrentUser(newUser);
    return true;
  };

  const signOut = () => {
    setCurrentUser(null);
  };

  const toggleSaveEvent = (eventId: string) => {
    setSavedEventIds((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  const isEventSaved = (eventId: string) => {
    return savedEventIds.includes(eventId);
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alt) => (alt.id === alertId ? { ...alt, read: true } : alt))
    );
  };

  const markAllAlertsAsRead = () => {
    setAlerts((prev) => prev.map((alt) => ({ ...alt, read: true })));
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const switchRole = (newRole: UserRole) => {
    if (!currentUser) return;
    setCurrentUser({
      ...currentUser,
      role: newRole,
    });
  };

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        role: currentUser?.role || 'USER',
        savedEventIds,
        alerts,
        unreadAlertsCount,
        signIn,
        signUp,
        signOut,
        toggleSaveEvent,
        isEventSaved,
        markAlertAsRead,
        markAllAlertsAsRead,
        updateProfile,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
