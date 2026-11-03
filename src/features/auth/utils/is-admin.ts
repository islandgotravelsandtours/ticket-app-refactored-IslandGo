import {User as AuthUser} from "lucia";

export const isAdmin = (authUser: AuthUser | null | undefined) =>
    authUser?.role === "ADMIN";
