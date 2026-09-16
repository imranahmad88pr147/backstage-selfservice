import { useEffect, useState } from 'react';

import {
  Sidebar,
  SidebarDivider,
  SidebarGroup,
  SidebarItem,
} from '@backstage/core-components';

import { NavContentBlueprint } from '@backstage/plugin-app-react';

import { useApi } from '@backstage/core-plugin-api';

import { SidebarLogo } from './SidebarLogo';
import MenuIcon from '@material-ui/icons/Menu';

import { entraAuthApiRef } from '../../apis/authApis';

export const SidebarContent = NavContentBlueprint.make({
  params: {
    component: function SidebarContentComponent({ navItems }) {
      const authApi = useApi(entraAuthApiRef);

      const [displayName, setDisplayName] =
        useState('User');

      useEffect(() => {
        authApi
          .getProfile()
          .then(profile => {
            if (profile?.displayName) {
              setDisplayName(profile.displayName);
            }
          })
          .catch(() => {
            setDisplayName('User');
          });
      }, [authApi]);

      const nav = navItems.withComponent(item => (
        <SidebarItem
          icon={() => item.icon}
          to={item.href}
          text={item.title}
        />
      ));

      return (
        <Sidebar>
          <SidebarLogo />

          <SidebarDivider />

          <SidebarGroup label="Menu" icon={<MenuIcon />}>
            {nav.take('page:home')}
            {nav.take('page:scaffolder')}
          </SidebarGroup>

          <SidebarDivider />

          <SidebarItem
            icon={() => null}
            text={displayName}
            to="#"
          />
        </Sidebar>
      );
    },
  },
});