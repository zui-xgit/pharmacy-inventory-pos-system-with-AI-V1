// export type User = {
//     username: string;
//     firstname: string;
//     lastname: string;
//     phone: string;
//     gender: string;
//     email: string;
//     avatar?: string;
//     email_verified_at: string | null;
//     created_at: string;
//     updated_at: string;
//     [key: string]: unknown;
// };
export type User = {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    roles: string[];
    shop_uuid: string;
    isAdmin: boolean;
    isManager: boolean;
    isCashier: boolean;
    isAdminOrManager: boolean;
    isManagerOrCashier: boolean;

    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */
