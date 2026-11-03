import {Heading} from "@/components/heading";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {ProfileForm} from "@/features/account/components/profile-form";
import {getAuthOrRedirect} from "@/features/auth/queries/get-auth-or-redirect";
import {isAdmin} from "@/features/auth/utils/is-admin";
import {prisma} from "@/lib/prisma";
import {toCurrencyFromCent} from "@/utils/currency";
import {AccountTabs} from "../_navigation/tabs";

const ProfilePage = async () => {
    const {user} = await getAuthOrRedirect();
    const admin = isAdmin(user);

    const [bookings, paid, tours] = await Promise.all([
        prisma.booking.count({where: {userId: user.id}}),
        prisma.payment.aggregate({
            where: {userId: user.id, status: "PAID"},
            _sum: {amount: true},
        }),
        admin ? prisma.tour.count({where: {userId: user.id}}) : Promise.resolve(0),
    ]);

    const summary: [string, string][] = [
        ["Account type", admin ? "Admin" : "Customer"],
        ["Bookings", String(bookings)],
        ...(admin
            ? ([["Tours published", String(tours)]] as [string, string][])
            : ([["Total paid", toCurrencyFromCent(paid._sum.amount ?? 0)]] as [string, string][])),
    ];

    return (
        <div className="flex-1 flex flex-col gap-y-8">
            <Heading
                title="Profile"
                description="All your profile information"
                tabs={<AccountTabs/>}
            />

            <div className="flex flex-col items-center gap-y-4 px-4">
                <Card className="w-full max-w-[580px]">
                    <CardHeader>
                        <CardTitle>Your details</CardTitle>
                        <CardDescription>Update your photo, full name, username and email.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProfileForm
                            fullName={user.fullName}
                            username={user.username}
                            email={user.email}
                            avatarUrl={user.avatarUrl}
                        />
                    </CardContent>
                </Card>

                <Card className="w-full max-w-[580px]">
                    <CardHeader>
                        <CardTitle>Account summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="flex flex-col gap-y-2 text-sm">
                            {summary.map(([k, v]) => (
                                <div key={k} className="flex justify-between">
                                    <dt className="text-muted-foreground">{k}</dt>
                                    <dd className="font-medium">{v}</dd>
                                </div>
                            ))}
                        </dl>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
