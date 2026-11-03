import {Heading} from "@/components/heading";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {PasswordForm} from "@/features/account/components/password-form";
import {AccountTabs} from "../_navigation/tabs";

const PasswordPage = () => {
    return (
        <div className="flex-1 flex flex-col gap-y-8">
            <Heading
                title="Password"
                description="Keep your account secure"
                tabs={<AccountTabs/>}
            />

            <div className="flex flex-col items-center px-4">
                <Card className="w-full max-w-[580px]">
                    <CardHeader>
                        <CardTitle>Change password</CardTitle>
                        <CardDescription>
                            Changing it signs you out on all your other devices.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PasswordForm/>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PasswordPage;
