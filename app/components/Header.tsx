import {Await, NavLink} from '@remix-run/react';
import {Suspense} from 'react';
import type {HeaderQuery} from 'storefrontapi.generated';
import type {LayoutProps} from './Layout';
import {useRootLoaderData} from '~/lib/root-data';
import img_user from '../assets/user.svg';

type HeaderProps = Pick<LayoutProps, 'header' | 'cart' | 'isLoggedIn'> & {
  children?: React.ReactNode;
};

type Viewport = 'desktop' | 'mobile';

export function Header({header, isLoggedIn, cart, children}: HeaderProps) {
  const {shop, menu} = header;

  console.log('menu actualizado', menu);

  return (
    <header className="header">
      <NavLink prefetch="intent" to="/" style={activeLinkStyle} end>
        <strong>{shop.name}</strong>
      </NavLink>
      <HeaderMenu
        menu={menu}
        viewport="desktop"
        primaryDomainUrl={header.shop.primaryDomain.url}
      />
      <section>{children}</section> {/* Renderizar children */}
      <HeaderCtas isLoggedIn={isLoggedIn} cart={cart} />
    </header>
  );
}

export function HeaderMenu({
  menu,
  primaryDomainUrl,
  viewport,
}: {
  menu: HeaderProps['header']['menu'];
  primaryDomainUrl: HeaderQuery['shop']['primaryDomain']['url'];
  viewport: Viewport;
}) {
  const {publicStoreDomain} = useRootLoaderData();
  const className = `header-menu-${viewport}`;

  function closeAside(event: React.MouseEvent<HTMLAnchorElement>) {
    if (viewport === 'mobile') {
      event.preventDefault();
      window.location.href = event.currentTarget.href;
    }
  }

  return (
    <nav className={className} role="navigation">
      {/* {viewport === 'mobile' && (
        <NavLink
          end
          onClick={closeAside}
          prefetch="intent"
          style={activeLinkStyle}
          to="/"
        >
          Home
        </NavLink>
      )} */}
      {FALLBACK_HEADER_MENU.items.map((item) => {
        if (!item.url) return null;
        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        return (
          <div className="header-menu-item-container" key={item.id}>
            <NavLink
              className="header-menu-item"
              end
              onClick={closeAside}
              prefetch="intent"
              style={activeLinkStyle}
              to={url}
            >
              {item.title}
            </NavLink>
            {item.items && item.items.length > 0 && (
              <div className="submenu">
                {item.items.map((subitem) => (
                  <NavLink
                    key={subitem.id}
                    className="submenu-item"
                    to={subitem.url}
                    style={activeLinkStyle}
                  >
                    {subitem.title}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function HeaderCtas({
  isLoggedIn,
  cart,
}: Pick<HeaderProps, 'isLoggedIn' | 'cart'>) {
  return (
    <nav className="header-ctas" role="navigation">
      <HeaderMenuMobileToggle />
      <NavLink prefetch="intent" to="/account" style={activeLinkStyle}>
        <Suspense fallback="Sign ins">
          <Await
            resolve={isLoggedIn}
            errorElement={<img src={img_user} alt="Error" />}
          >
            {(isLoggedIn) =>
              isLoggedIn ? 'Account' : <img src={img_user} alt="Error" />
            }
          </Await>
        </Suspense>
      </NavLink>
      <SearchToggle />
      <CartToggle cart={cart} />
    </nav>
  );
}

function HeaderMenuMobileToggle() {
  return (
    <a className="header-menu-mobile-toggle" href="#mobile-menu-aside">
      <h3>☰</h3>
    </a>
  );
}

function SearchToggle() {
  return (
    <a href="#search-aside">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="currentColor"
        className="bi bi-search-heart"
        viewBox="0 0 16 16"
      >
        <path d="M6.5 4.482c1.664-1.673 5.825 1.254 0 5.018-5.825-3.764-1.664-6.69 0-5.018" />
        <path d="M13 6.5a6.47 6.47 0 0 1-1.258 3.844q.06.044.115.098l3.85 3.85a1 1 0 0 1-1.414 1.415l-3.85-3.85a1 1 0 0 1-.1-.115h.002A6.5 6.5 0 1 1 13 6.5M6.5 12a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11" />
      </svg>
    </a>
  );
}

function CartBadge({count}: {count: number}) {
  return (
    <a href="#cart-aside" className='cart_count'>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        fill="currentColor"
        className="bi bi-cart-check"
        viewBox="0 0 16 16"
      >
        <path d="M11.354 6.354a.5.5 0 0 0-.708-.708L8 8.293 6.854 7.146a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0z" />
        <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1zm3.915 10L3.102 4h10.796l-1.313 7zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0m7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
      </svg>{' '}
      <strong>{count}</strong>
    </a>
  );
}

function CartToggle({cart}: Pick<HeaderProps, 'cart'>) {
  return (
    <Suspense fallback={<CartBadge count={0} />}>
      <Await resolve={cart}>
        {(cart) => {
          if (!cart) return <CartBadge count={0} />;
          return <CartBadge count={cart.totalQuantity || 0} />;
        }}
      </Await>
    </Suspense>
  );
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Home',
      type: 'HTTP',
      url: '/',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609500788',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections/all',
      items: [
        {
          id: 'gid://shopify/MenuItem/1',
          resourceId: null,
          tags: [],
          title: 'Baroque',
          type: 'HTTP',
          url: '/collections/baroque',
        },
        {
          id: 'gid://shopify/MenuItem/2',
          resourceId: null,
          tags: [],
          title: 'Pablo Picasso',
          type: 'HTTP',
          url: '/collections/pablo-picasso',
        },
        {
          id: 'gid://shopify/MenuItem/3',
          resourceId: null,
          tags: [],
          title: 'Italian Renaissance',
          type: 'HTTP',
          url: '/collections/italian-renaissance',
        },
      ],
    },
    // {
    //   id: 'gid://shopify/MenuItem/461609533496',
    //   resourceId: null,
    //   tags: [],
    //   title: 'Blog',
    //   type: 'HTTP',
    //   url: '/blogs/journal',
    //   items: [],
    // },
    // {
    //   id: 'gid://shopify/MenuItem/461609566264',
    //   resourceId: null,
    //   tags: [],
    //   title: 'Policies',
    //   type: 'HTTP',
    //   url: '/policies',
    //   items: [],
    // },
    // {
    //   id: 'gid://shopify/MenuItem/461609599032',
    //   resourceId: 'gid://shopify/Page/92591030328',
    //   tags: [],
    //   title: 'About',
    //   type: 'PAGE',
    //   url: '/pages/about',
    //   items: [],
    // },
    // {
    //   id: 'gid://shopify/MenuItem/461609599882',
    //   resourceId: 'gid://shopify/Page/92591030328',
    //   tags: [],
    //   title: 'Us',
    //   type: 'PAGE',
    //   url: '/search',
    //   items: [],
    // },
    // {
    //   id: 'gid://shopify/MenuItem/461609519888',
    //   resourceId: 'gid://shopify/Page/92591030328',
    //   tags: [],
    //   title: 'Contact',
    //   type: 'PAGE',
    //   url: '/contact',
    //   items: [],
    // },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'black',
  };
}
