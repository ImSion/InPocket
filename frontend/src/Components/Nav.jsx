import { useAuth0 } from "@auth0/auth0-react";
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
} from "flowbite-react";

export default function Nav() {
  const { user, isAuthenticated, logout, loginWithRedirect } = useAuth0();

  return (
    <Navbar fluid>
      <NavbarBrand href="">
        <img src="https://picsum.photos/seed/picsum/200/300" className="mr-3 h-6 sm:h-9" alt="" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Flowbite React</span>
      </NavbarBrand>
      <div className="flex md:order-2">
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
            <DropdownHeader>
              <span className="block text-sm">{user.name}</span>
              <span className="block truncate text-sm font-medium">{user.email}</span>
            </DropdownHeader>
            <DropdownItem>Dashboard</DropdownItem>
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
            <Button size="sm" onClick={() => loginWithRedirect({ screen_hint: 'signup' })}>
              Registrati
            </Button>
          </div>
        )}
        <NavbarToggle />
      </div>
      <NavbarCollapse>
        <NavbarLink href="#" active>
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