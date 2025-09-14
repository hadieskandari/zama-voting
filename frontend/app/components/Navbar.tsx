import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Navbar: React.FC = () => {
    return (
        <NavigationMenu.Root className=" flex items-center justify-between px-8 py-4 mb-16 ">
            <NavigationMenu.List className="flex items-center gap-6">
                <NavigationMenu.Item>
                    <div className="flex items-center space-x-2 hover:opacity-80"><img alt="Collide Logo" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" className="w-5 sm:w-6" src="https://opinions.fun/_next/image?url=%2Flogo_white.png&amp;w=48&amp;q=75&amp;dpl=dpl_AStURAeDZfk3GcvqoEUogCw7G5Bq" /><a className="text-md sm:text-md text-mutedwhite font-medium" href="/">opinions.fun</a></div>
                </NavigationMenu.Item>
            </NavigationMenu.List>
            <NavigationMenu.List className="flex items-center">
                <NavigationMenu.Item>
                    <ConnectButton />
                </NavigationMenu.Item>
            </NavigationMenu.List>
        </NavigationMenu.Root>
    );
};

export default Navbar;
