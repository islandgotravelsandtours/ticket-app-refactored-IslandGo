import {User as AuthUser} from "lucia";
import {usePathname} from "next/navigation";
import {useEffect, useState} from "react";
import {getAuth} from "../queries/get-auth";

const useAuth = () => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isFetched, setFetched] = useState(false);

    const pathname = usePathname();

    useEffect(() => {
        const fetchUser = async () => {
            const {user} = await getAuth();
            setUser(user);
            setFetched(true);
        };

        fetchUser();

        // Profile changes (photo, name) dispatch this so the header updates right away.
        window.addEventListener("auth-changed", fetchUser);
        return () => window.removeEventListener("auth-changed", fetchUser);
    }, [pathname]);

    return {user, isFetched};
};

export {useAuth};