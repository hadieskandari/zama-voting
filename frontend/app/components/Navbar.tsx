import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import CardNav from './cardNav';
import logo from './logo.svg';

const Navbar: React.FC = () => {

    const items = [
        {
            label: "About",
            bgColor: "#000000",
            textColor: "#fff",
            links: [
                { label: "Company", ariaLabel: "About Company" },
                { label: "Careers", ariaLabel: "About Careers" }
            ],
            href: "#"
        },
        {
            label: "Projects",
            bgColor: "#170D27",
            textColor: "#fff",
            links: [
                { label: "Featured", ariaLabel: "Featured Projects" },
                { label: "Case Studies", ariaLabel: "Project Case Studies" }
            ],
            href: "#"
        },
        {
            label: "Contact",
            bgColor: "#271E37",
            textColor: "#fff",
            links: [
                { label: "Email", ariaLabel: "Email us" },
                { label: "Twitter", ariaLabel: "Twitter" },
                { label: "LinkedIn", ariaLabel: "LinkedIn" }
            ],
            href: "#"
        }
    ];

    return (
        <NavigationMenu.Root className=" flex items-center justify-between px-8 py-4 mb-16 ">
            {/* <NavigationMenu.List className="flex items-center gap-6">
                <NavigationMenu.Item>
                    <div className="flex items-center space-x-2 hover:opacity-80"><img alt="Collide Logo" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-5 sm:w-6" src="https://opinions.fun/_next/image?url=%2Flogo_white.png&amp;w=48&amp;q=75&amp;dpl=dpl_AStURAeDZfk3GcvqoEUogCw7G5Bq" /><a className="text-md sm:text-md text-mutedwhite font-medium" href="/">opinions.fun</a></div>
                </NavigationMenu.Item>
            </NavigationMenu.List>
            <NavigationMenu.List className="flex items-center">
                <NavigationMenu.Item>
                    <ConnectButton />
                </NavigationMenu.Item>
            </NavigationMenu.List> */}



            <CardNav
                logo={logo}
                logoAlt="Zama CV"
                items={items}
                baseColor="#0000009f"
                menuColor="#000"
                buttonBgColor="#111"
                buttonTextColor="#fff"
                ease="power3.out"
            />

        </NavigationMenu.Root>
    );
};

export default Navbar;
