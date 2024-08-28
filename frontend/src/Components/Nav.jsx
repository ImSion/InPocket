import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";
import {
  Avatar,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
  DarkThemeToggle
} from "flowbite-react";
import logo from '../assets/Logo.png'
import Notifications from './Notifications';
import { useContext, useEffect } from 'react';
import { NotificationContext } from '../Contexts/NotificationContext.jsx';

export default function Nav({ userData }) {
  const { user, isAuthenticated, logout } = useAuth0();
  const { hasNewInvite, checkInvites } = useContext(NotificationContext);

  useEffect(() => {
    checkInvites();
  }, [checkInvites]);

  const profileImage = userData?.avatar || user?.picture;

  return (
    <Navbar className="fixed w-full z-10 bottom-0" fluid>
      <NavbarBrand href="/home">
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">In</span>
        <img src={logo} className="h-10 sm:h-9" alt="Logo InPocket" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">ocket</span>
      </NavbarBrand>
      <div className="flex md:order-2 justify-center items-center">
        <DarkThemeToggle className="mr-3 hover:shadow-[inset_0px_0px_8px] dark:hover:shadow-amber-300 dark:hover:text-amber-300 hover:shadow-sky-800 hover:text-sky-800 hover:bg-transparent rounded-lg border-2 border-slate-500 p-1 w-10 h-10 sm:h-10 sm:w-14 text-center justify-center flex items-center transition-all ease-in-out duration-500 hover:scale-105" />
        {isAuthenticated && (
          <>
            <Notifications notifications={Notifications}/>
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Avatar 
                  alt="User settings" 
                  img={profileImage} 
                />
              }
            >
              <DropdownHeader className="z-10">
                <span className="block truncate text-sm font-medium">
                  {userData?.email || user.email || 'Email non disponibile'}
                </span>
              </DropdownHeader>
              <DropdownItem>
                <Link to={'/profile'}>
                  Profilo
                </Link>
              </DropdownItem>
              <DropdownItem>Settings</DropdownItem>
              <DropdownItem>Earnings</DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={() => logout({ returnTo: window.location.origin })}>Sign out</DropdownItem>
            </Dropdown>
            <NavbarToggle className="ml-2"/>
          </>
        )}
      </div>
      {isAuthenticated && (
        <NavbarCollapse>
          <NavbarLink href="/home" active>
            Home
          </NavbarLink>
          <NavbarLink href="/groups">Gruppi</NavbarLink>
        </NavbarCollapse>
      )}
    </Navbar>
  );
}