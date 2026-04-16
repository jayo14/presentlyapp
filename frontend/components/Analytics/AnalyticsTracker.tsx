import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component that tracks page views across route changes for Google Analytics.
 * It should be placed inside a Router context.
 */
export const AnalyticsTracker = () => {
    const location = useLocation();

    useEffect(() => {
        // Only track if gtag is available (prevent errors in development if blocked)
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'page_view', {
                page_path: location.pathname + location.search,
                page_location: window.location.href,
                page_title: document.title,
            });
        }
    }, [location]);

    return null;
};

// Types for gtag to prevent TS errors
declare global {
    interface Window {
        gtag: (
            command: 'config' | 'event' | 'js' | 'set',
            targetId: string,
            config?: Record<string, any>
        ) => void;
        dataLayer: any[];
    }
}
