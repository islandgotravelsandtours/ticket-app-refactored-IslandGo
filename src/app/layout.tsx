import "./globals.css";
import type {Metadata} from "next";
import {Bricolage_Grotesque} from "next/font/google";
import localFont from "next/font/local";
import {NuqsAdapter} from "nuqs/adapters/next/app";
import {Sidebar} from "@/app/_navigation/sidebar/components/sidebar";
import {ThemeProvider} from "@/components/theme/theme-provider";
import {Toaster} from "@/components/ui/sonner";
import {Header} from "./_navigation/header";
import {ReactQueryProvider} from "./_providers/react-query/react-query-provider";

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const display = Bricolage_Grotesque({
    subsets: ["latin"],
    variable: "--font-display",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "IslandGo | Travels and Tours",
    description: "Book guided island tours, pay online and go.",
    icons: {
        icon: '/favicon.svg',
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html suppressHydrationWarning lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} ${display.variable} antialiased`}
        >
        <NuqsAdapter>
            <ThemeProvider>
                <ReactQueryProvider>
                    <Header/>
                    <div className="flex h-screen overflow-hidden border-collapse">
                        <Sidebar/>
                        <main
                            className="
                min-h-screen flex-1
                overflow-y-auto overflow-x-hidden
                pt-36 pb-24 px-8
                bg-secondary/20
                flex flex-col
              "
                        >
                            {children}
                        </main>
                    </div>
                    <Toaster expand/>
                </ReactQueryProvider>
            </ThemeProvider>
        </NuqsAdapter>
        </body>
        </html>
    );
}