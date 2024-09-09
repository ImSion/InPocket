
import {
    Footer,
    FooterBrand,
    FooterCopyright,
    FooterDivider,
    FooterIcon,
    FooterLink,
    FooterLinkGroup,
    FooterTitle,
  } from "flowbite-react";
  import { BsDribbble, BsFacebook, BsGithub, BsInstagram, BsTwitter } from "react-icons/bs";
  import logo from '../assets/Logo.png'
  
  export default function MyFooter() {
    return (
      <Footer container className="pb-24 rounded-none bg-white bg-opacity-70 dark:bg-sky-950 dark:bg-opacity-90">
        <div className="w-full">
          <div className="grid w-full justify-between sm:flex sm:justify-between md:flex md:grid-cols-1">
            <div className="flex justify-center items-center pb-5">
              <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white" translate="no">In</span>
                <img
                src={logo} className=" h-10 sm:h-9" alt="Logo InPocket" 
                />
              <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white" translate="no">ocket</span>



              
            </div>
            <div className="sm:grid flex gap-8 sm:mt-4 sm:grid-cols-3 sm:gap-6">
              <div>
                <FooterTitle title="about" translate="no"/>
                <FooterLinkGroup col>
                  <FooterLink href="#" translate="no">Flowbite</FooterLink>
                  <FooterLink href="#" translate="no">Tailwind CSS</FooterLink>
                </FooterLinkGroup>
              </div>
              <div>
                <FooterTitle title="Follow us"/>
                <FooterLinkGroup col>
                  <FooterLink href="https://github.com/ImSion" translate="no">Github</FooterLink>
                  <FooterLink href="https://www.linkedin.com/in/gabriele-romano-69aa81252/?originalSubdomain=it" translate="no">Linkedin</FooterLink>
                </FooterLinkGroup>
              </div>
              <div>
                <FooterTitle title="Legal" translate="no"/>
                <FooterLinkGroup col>
                  <FooterLink href="#">Privacy Policy</FooterLink>
                  <FooterLink href="#">Terms &amp; Conditions</FooterLink>
                </FooterLinkGroup>
              </div>
            </div>
          </div>
          <FooterDivider />
          <div className="w-full sm:flex sm:items-center sm:justify-between">
            <FooterCopyright href="#" by="InPocket™" year={2024} />
            <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
              <FooterIcon href="#" icon={BsFacebook} />
              <FooterIcon href="#" icon={BsInstagram} />
              <FooterIcon href="#" icon={BsTwitter} />
              <FooterIcon href="#" icon={BsGithub} />
              <FooterIcon href="#" icon={BsDribbble} />
            </div>
          </div>
        </div>
      </Footer>
    );
  }
  