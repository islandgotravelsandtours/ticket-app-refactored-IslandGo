import {redirect} from "next/navigation";
import {homePath} from "@/paths";
import {isAdmin} from "../utils/is-admin";
import {getAuthOrRedirect} from "./get-auth-or-redirect";

// Use in pages and server actions that only admins may access.
export const getAdminOrRedirect = async () => {
    const auth = await getAuthOrRedirect();

    if (!isAdmin(auth.user)) {
        redirect(homePath());
    }

    return auth;
};
