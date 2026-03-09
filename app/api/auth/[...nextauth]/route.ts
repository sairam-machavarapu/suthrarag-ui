import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

const ADMIN_EMAILS = [
    "admin@suthratech.com",
    "machavarapusairam2002@gmail.com"
];

const handler = NextAuth({
    providers: [
        AzureADProvider({
            clientId: process.env.AZURE_CLIENT_ID || "",
            clientSecret: process.env.AZURE_CLIENT_SECRET || "",
            tenantId: process.env.AZURE_TENANT_ID || "",
            authorization: {
                params: {
                    scope: "openid profile email User.Read",
                },
            },
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            if (!user.email) return false;

            const isSuthraDomain = user.email.toLowerCase().endsWith("@suthratech.com");
            const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());

            if (isSuthraDomain || isAdmin) {
                return true;
            }
            return "/auth/signin?error=AccessDenied";
        },
        async jwt({ token, user, account }: any) {
            if (user && account) {
                token.id_token = account.id_token;
                token.email = user.email;
                token.name = user.name;
                token.roles = ADMIN_EMAILS.includes(user.email!.toLowerCase()) ? ["Admin"] : ["User"];
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                (session.user as any).roles = token.roles || ["User"];
                (session.user as any).id_token = token.id_token;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
});

export { handler as GET, handler as POST };
