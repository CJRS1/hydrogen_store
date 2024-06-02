import {useMatches} from '@remix-run/react';
import {useMemo} from 'react';

const DEFAULT_LOCALE = {/* Empty for demonstration purposes.*/}

/**
 * Custom hook to aggregate `analytics` data returned by Remix loaders
 * @param hasUserConsent {Boolean}
 * @returns Object with aggregated analytics data
 */
export function usePageAnalytics({hasUserConsent}) {
  // useMatches returns an array of nested routes
  const matches = useMatches();

  // useMemo improves performance by only running when `matches` changes.
  const analyticsFromMatches = useMemo(() => {
    const data: Record<string, unknown> = {};

    // For each nested route, get the `analytics` object returned
    // by its loader function and assign to `data`
    matches.forEach((event) => {
      const eventData = event?.data;
      if (eventData) {
        eventData['analytics'] && Object.assign(data, eventData['analytics']);

        // This hook also allows you to optionally collect data such as
        // currency and language preferences.
        const selectedLocale = eventData['selectedLocale'] || DEFAULT_LOCALE;
        Object.assign(data, {
          currency: selectedLocale.currency,
          acceptedLanguage: selectedLocale.language,
        });
      }
    });

    return { ...data, hasUserConsent };
  }, [matches]);

  return analyticsFromMatches;
}
