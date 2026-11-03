import Link from "next/link";
import {Placeholder} from "@/components/placeholder";
import {Button} from "@/components/ui/button";
import {toursPath} from "@/paths";

export default function NotFound() {
    return (
        <Placeholder
            label="Tour not found"
            button={
                <Button asChild variant="outline">
                    <Link href={toursPath()}>Go to tours</Link>
                </Button>
            }
        />
    );
}