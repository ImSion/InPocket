import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, Link, } from "react-router-dom";
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
  Button,
  DarkThemeToggle, 
  Flowbite
} from "flowbite-react";
import logo from '../assets/Logo.png'

export default function Nav({ userData }) {
  const { user, isAuthenticated, logout, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <Navbar className="fixed w-full z-10" fluid>
      <NavbarBrand href="/home">
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">In</span>
        <img src={logo} className=" h-10 sm:h-9" alt="" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">ocket</span>
      </NavbarBrand>
      <div className="flex md:order-2 justify-center items-center">
        <DarkThemeToggle className="mr-3 hover:shadow-[inset_0px_0px_8px] dark:hover:shadow-amber-300 dark:hover:text-amber-300 hover:shadow-sky-800 hover:text-sky-800 hover:bg-transparent rounded-full border-2 border-slate-500 p-1 w-6 h-6 sm:h-10 sm:w-10 text-center justify-center flex items-center transition-all ease-in-out duration-500 hover:scale-105" />
        {isAuthenticated ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar 
                alt="User settings" 
                img={user.picture} 
                rounded 
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
        ) : (
          <div className="flex items-center">
            <span className="mr-2">Effettua</span>
            <Button size="sm" onClick={() => loginWithRedirect()} className="mr-2">
              Login
            </Button>
            <span className="mr-2">o</span>
            <Button size="sm" onClick={handleRegister}>
              Registrati
            </Button>
          </div>
        )}
        <NavbarToggle />
      </div>
      <NavbarCollapse>
        <NavbarLink href="/home" active>
          Home
        </NavbarLink>
        <NavbarLink href="#">About</NavbarLink>
        <NavbarLink href="#">Services</NavbarLink>
        <NavbarLink href="#">Pricing</NavbarLink>
        <NavbarLink href="#">Contact</NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
}