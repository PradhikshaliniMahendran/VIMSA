import { useState, useEffect } from 'react';
import { settingsService, GlobalSettings } from '../services/settingsService.ts';

export const useStoreSettings = () => {
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      try {
        const res = await settingsService.getSettings();
        if (res.success && res.data && isMounted) {
          setSettings(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch store settings:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const whatsappNumber = settings?.whatsappNumber || '+94771234567';
  const cleanWhatsappNumber = whatsappNumber.replace(/[^0-9]/g, '') || '94771234567';
  const contactNumber = settings?.contactNumber || '+94 77 123 4567';
  const email = settings?.email || 'support@vimsaclothing.com';
  const address = settings?.address || 'Bogawanthalawa, Sri Lanka';
  const storeName = settings?.storeName || 'VIMSA';
  const facebookUrl = settings?.facebookUrl || 'https://facebook.com';
  const instagramUrl = settings?.instagramUrl || 'https://instagram.com';

  return {
    settings,
    loading,
    whatsappNumber,
    cleanWhatsappNumber,
    contactNumber,
    email,
    address,
    storeName,
    facebookUrl,
    instagramUrl,
  };
};
