import {PrismaAdapter} from "@lucia-auth/adapter-prisma";
import {Lucia} from "lucia";
import {prisma} from "./prisma";

const adapter = new PrismaAdapter(prisma.session, prisma.user);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        expires: false,
        attributes: {
            secure: process.env.NODE_ENV === "production",
        },
    },
    getUserAttributes: (attributes) => ({
        username: attributes.username,
        email: attributes.email,
        avatarUrl: attributes.avatarUrl,
        fullName: attributes.fullName,
        role: attributes.role,
    }),
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

interface DatabaseUserAttributes {
    username: string;
    email: string;
    avatarUrl: string | null;
    fullName: string | null;
    role: "ADMIN" | "CUSTOMER";
}