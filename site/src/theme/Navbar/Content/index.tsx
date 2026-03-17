import React from 'react';
import NavbarContent from '@theme-original/Navbar/Content';
import type { Props } from '@theme/Navbar/Content';

export default function NavbarContentWrapper(props: Props): JSX.Element {
  return <NavbarContent {...props} />;
}
