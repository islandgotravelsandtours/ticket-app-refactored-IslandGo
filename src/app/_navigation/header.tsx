"use client";

import {Plane} from "lucide-react";
import Link from "next/link";
import {AccountDropdown} from "@/app/_navigation/account-dropdown";
import {useAuth} from "@/features/auth/hooks/use-auth";
import {cn} from "@/lib/utils";
import {homePath, signInPath, signUpPath} from "@/paths";
import {ThemeSwitcher} from "../../components/theme/theme-switcher";
import {buttonVariants} from "../../components/ui/button";

const Header = () => {
    const {user, isFetched} = useAuth();

    if (!isFetched) {
        return null;
    }

    const navItems = user ? (
        <AccountDropdown user={user}/>
    ) : (
        <>
            <Link
                href={signUpPath()}
                className={buttonVariants({variant: "outline"})}
            >
                Sign Up
            </Link>
            <Link
                href={signInPath()}
                className={buttonVariants({variant: "default"})}
            >
                Sign In
            </Link>
        </>
    );

    return (
        <nav
            className="
        animate-header-from-top
        supports-backdrop-blur:bg-background/60
        fixed left-0 right-0 top-0 z-20
        border-b bg-background/95 backdrop-blur
        w-full flex items-center py-3 px-12 justify-between
      "
        >
            <div className="flex items-center gap-x-2">
                <Link
                    href={homePath()}
                    className={cn(buttonVariants({variant: "ghost"}), "h-auto py-1")}
                >
                    <Plane className="h-7 w-7"/>
                    <div className="flex flex-col items-start leading-tight">
                        <h1 className="text-2xl font-bold">IslandGo</h1>
                        <span className="text-1xl text-muted-foreground">
                            Travels and Tours · Book, Pay and Go
                        </span>
                    </div>
                </Link>
            </div>
            <div className="flex items-center gap-x-2">
                <ThemeSwitcher/>
                {navItems}
            </div>
        </nav>
    );
};

export {Header};