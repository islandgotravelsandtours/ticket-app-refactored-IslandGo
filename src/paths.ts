export const homePath = () => "/";

export const signUpPath = () => "/sign-up";
export const signInPath = () => "/sign-in";
export const passwordForgotPath = () => "/password-forgot";

export const accountProfilePath = () => "/account/profile";
export const accountPasswordPath = () => "/account/password";

export const toursPath = () => "/tours";
export const tourPath = (tourId: string) => `/tours/${tourId}`;
export const tourEditPath = (tourId: string) => `/tours/${tourId}/edit`;

export const bookingsPath = () => "/bookings";

export const transactionsPath = () => "/transactions";
export const transactionPath = (paymentId: string) => `/transactions/${paymentId}`;
