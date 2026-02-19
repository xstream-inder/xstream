import { cn } from '@/lib/utils';

export { cn };

export const adConfig = {
  isEnabled: process.env.NEXT_PUBLIC_ADS_ENABLED === 'true',
  exoclick: {
    sidebarZoneId: process.env.NEXT_PUBLIC_EXOCLICK_ZONE_SIDEBAR,
    footerZoneId: process.env.NEXT_PUBLIC_EXOCLICK_ZONE_FOOTER,
    mobileZoneId: process.env.NEXT_PUBLIC_EXOCLICK_ZONE_MOBILE,
  },
};
