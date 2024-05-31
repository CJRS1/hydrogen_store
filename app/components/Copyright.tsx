import { Link } from '@remix-run/react';

export default function Copyright() {
  const date = new Date().getFullYear();
  return (
    <p>
      Copyright © rshippingperu.com {" "}
      <Link to="/">RS</Link> {date}. All rights reserved.
    </p>
  );
}
