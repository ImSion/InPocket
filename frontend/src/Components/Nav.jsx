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
} from "flowbite-react";

export default function Nav() {
  const { user, isAuthenticated, logout } = useAuth0();

  return (
    <Navbar fluid>
      <NavbarBrand href="">
        <img src="https://picsum.photos/seed/picsum/200/300" className="mr-3 h-6 sm:h-9" alt="" />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Flowbite React</span>
      </NavbarBrand>
      <div className="flex md:order-2">
        <Dropdown
          arrowIcon={false}
          inline
          label={
            <Avatar 
              alt="User settings" 
              img={isAuthenticated ? user.picture : "https://flowbite.com/docs/images/people/profile-picture-5.jpg"} 
              rounded 
            />
          }
        >
          <DropdownHeader>
            <span className="block text-sm">{isAuthenticated ? user.name : "Guest"}</span>
            <span className="block truncate text-sm font-medium">{isAuthenticated ? user.email : "guest@example.com"}</span>
          </DropdownHeader>
          <DropdownItem>Dashboard</DropdownItem>
          <DropdownItem>Settings</DropdownItem>
          <DropdownItem>Earnings</DropdownItem>
          <DropdownDivider />
          {isAuthenticated ? (
            <DropdownItem onClick={() => logout({ returnTo: window.location.origin })}>Sign out</DropdownItem>
          ) : (
            <DropdownItem href="/login">Sign in</DropdownItem>
          )}
        </Dropdown>
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