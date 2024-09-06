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
    <Navbar className="fixed w-full z-10 bottom-0 dark:bg-black" fluid>
      <NavbarBrand href="/home">
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">In</span>
        <img src={logo} className="h-10 sm:h-9" alt="Logo InPocket" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">ocket</span>
      </NavbarBrand>
      <div className="flex md:order-2 justify-center items-center">
        <DarkThemeToggle className="mr-3 hover:shadow-[inset_0px_0px_8px] dark:hover:shadow-amber-300 dark:hover:text-amber-300 hover:shadow-sky-800 hover:text-sky-800 hover:bg-transparent rounded-full border-2 border-slate-500 p-1 w-10 h-10 sm:h-10 sm:w-14 text-center justify-center flex items-center transition-all ease-in-out duration-500 hover:scale-105" />
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
                  className="dark:shadow-[0px_0px_10px] dark:shadow-sky-600 dark:hover:shadow-[0px_0px_20px] hover:dark:shadow-sky-600 transition-all ease-in-out duration-500" 
                />
              }
            >
              <DropdownHeader className="z-10">
                <span className="block truncate text-sm font-medium">
                  {userData?.email || user.email || 'Email non disponibile'}
                </span>
              </DropdownHeader>
              <DropdownItem className="flex items-center justify-center text-lg">
                <Link to={'/profile'} className="flex items-center gap-2">
                  Profilo
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </Link>
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem className="flex items-center justify-center text-lg gap-2" onClick={() => logout({ returnTo: window.location.origin })}>
                Logout
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
                </DropdownItem>
            </Dropdown>
            <NavbarToggle className="ml-2"/>
          </>
        )}
      </div>
      {isAuthenticated && (
        <NavbarCollapse>
          <NavbarLink href="/home">
          <div className="flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <p className="text-xs">Home</p>
          </div>
          </NavbarLink>
          <NavbarLink href="/groups">
          <div className="flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
            </svg>
            <p className="text-xs">Gruppi</p>
          </div>          
          </NavbarLink>
        </NavbarCollapse>
      )}
    </Navbar>
  );
}