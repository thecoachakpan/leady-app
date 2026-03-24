import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

interface BrandingSettings {
  app_name: string;
  logo_url: string;
  primary_color: string;
}

interface BrandingContextType extends BrandingSettings {
  loading: boolean;
  refreshBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<BrandingSettings>({
    app_name: 'Leady',
    logo_url: '',
    primary_color: '#2563eb',
  });
  const [loading, setLoading] = useState(true);

  const applyBranding = useCallback((settings: BrandingSettings) => {
    // Update Title
    document.title = settings.app_name;

    // Update Favicon
    if (settings.logo_url) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.logo_url;
    }

    // Update CSS Variables
    const root = document.documentElement;
    root.style.setProperty('--primary', settings.primary_color);
    
    // Simple way to generate a hover color (darken)
    // In a real app, you might use a library or color-mix
    root.style.setProperty('--primary-hover', settings.primary_color + 'dd'); 
  }, []);

  const fetchBranding = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('app_name, logo_url, primary_color')
        .maybeSingle();

      if (error) {
        console.error('Error fetching branding:', error);
      } else if (data) {
        const newBranding = {
          app_name: data.app_name || 'Leady',
          logo_url: data.logo_url || '',
          primary_color: data.primary_color || '#2563eb',
        };
        setBranding(newBranding);
        applyBranding(newBranding);
      }
    } catch (err) {
      console.error('Unexpected error fetching branding:', err);
    } finally {
      setLoading(false);
    }
  }, [applyBranding]);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  const refreshBranding = async () => {
    setLoading(true);
    await fetchBranding();
  };

  return (
    <BrandingContext.Provider value={{ ...branding, loading, refreshBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};
