"use client";

import {Printer} from "lucide-react";
import {useRouter} from "next/navigation";
import {useEffect} from "react";
import {Button} from "@/components/ui/button";

// While a payment is still PENDING (customer just came back from the gateway and
// the webhook hasn't landed), re-render the server page every 3s for ~45s.
const ReceiptActions = ({pending}: { pending: boolean }) => {
    const router = useRouter();

    useEffect(() => {
        if (!pending) return;
        let tries = 0;
        const id = setInterval(() => {
            tries += 1;
            router.refresh();
            if (tries >= 15) clearInterval(id);
        }, 3000);
        return () => clearInterval(id);
    }, [pending, router]);

    return (
        <Button variant="outline" onClick={() => window.print()} className="print:hidden">
            <Printer className="mr-2 h-4 w-4"/>
            Print receipt
        </Button>
    );
};

export {ReceiptActions};
