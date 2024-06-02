import {
  AnalyticsEventName,
  CartForm,
  ShopifyAnalyticsProduct,
  getClientBrowserParameters,
  sendShopifyAnalytics,
} from '@shopify/hydrogen';
import {useEffect} from 'react';
import {usePageAnalytics} from '../utils';
import {FetcherWithComponents} from '@remix-run/react';
import { CartLineInput } from '@shopify/hydrogen/storefront-api-types';

function AddToCartAnalytics({
  fetcher,
  children,
}: {
  fetcher: FetcherWithComponents<any>;
  children: React.ReactNode;
}): JSX.Element {
  // IMPORTANT: It’s up to you to ensure you have tracking consent
  // before updating this value to true.
  const hasUserConsent = false;

  const fetcherData = fetcher.data; // Action response data
  const formData = fetcher.formData; // Form input data
  // Page view data from loaders
  const pageAnalytics = usePageAnalytics({hasUserConsent});

  useEffect(() => {
    if (formData) {
      const cartData: Record<string, unknown> = {};
      const cartInputs = CartForm.getFormInput(formData);

      // Parse `analytics` data passed by CartForm
      try {
        if (cartInputs.inputs.analytics) {
          const dataInForm: unknown = JSON.parse(
            String(cartInputs.inputs.analytics),
          );
          Object.assign(cartData, dataInForm);
        }
      } catch {
        // do nothing
      }

      // If the cart action responded, send the analytics data
      if (Object.keys(cartData).length && fetcherData) {
        const addToCartPayload = {
          ...getClientBrowserParameters(),
          ...pageAnalytics,
          ...cartData,
          cartId: fetcherData.cart.id,
          shopId: fetcherData.cart.shopId || 'defaultShopId', // Asegúrate de que no sea undefined
  currency: fetcherData.cart.currency || 'USD', // Asegúrate de que no sea undefined
        };
        console.log('Sending analytics:', addToCartPayload);
        console.log('Sending analytics:', addToCartPayload);
        sendShopifyAnalytics({
          eventName: AnalyticsEventName.ADD_TO_CART,
          payload: addToCartPayload,
        });
      }
    }
  }, [fetcherData, formData, pageAnalytics]);
  return <>{children}</>;
}

export function AddToCartButton({
    children,
    lines,
    // Pass analytics data with a `productAnalytics` component prop
    productAnalytics,
    disabled = false
  }: {
    children: React.ReactNode;
    lines: CartLineInput[];
    productAnalytics: ShopifyAnalyticsProduct;
    disabled?: boolean;
  }) {
    const analytics = {
      products: [productAnalytics]
    };
  
    return (
      <CartForm
        route="/cart"
        inputs={
          {lines}
        }
        action={CartForm.ACTIONS.LinesAdd}
      >
        {(fetcher: FetcherWithComponents<any>) => {
          return (
            // Wrapper component uses `fetcher` provided by CartForm
            <AddToCartAnalytics fetcher={fetcher}>
  
              {/* Hidden input with analytics data */}
              <input
                type="hidden"
                name="analytics"
                value={JSON.stringify(analytics)}
              />
              <button
                type="submit"
                disabled={disabled  ?? fetcher.state !== 'idle'}
              >
                {children}
              </button>
            </AddToCartAnalytics>
          );
        }}
      </CartForm>
    );
  }
  