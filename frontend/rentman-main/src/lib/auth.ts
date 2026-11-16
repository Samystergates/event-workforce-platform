import type {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {axios} from "@/lib/axiosInstance";

// export type SessionAuthUser = {
//     id: string,
//     name: string,
//     email: string,
//     image?: string,
//     companyId: string,
//     modules: ModuleAttributes[]
// }

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/login',
    },
    providers: [
        CredentialsProvider({
            name: "Sign in",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "name@example.test",
                },
                password: {label: "Password", type: "password"},
            },
            async authorize(credentials: any) {
                const {email, password} = credentials
                const values = await axios.post('/v1/auth/login', {username: email, password: password})
                if (values.status === 200) {
                    return values.data;
                }

                throw new Error(values.data.message ?? values.data.error ?? 'Something went wrong. Please try again!');
            },
        }),
    ],
    callbacks: {
        jwt: async ({token, user}: any) => {

            if (user) {
                token.id = user.token;
                token.user = user.user;
            }

            return {...token};
        },
        async session({session, token}: any) {
            if (token && token.id) {
                session.user = {...token.user, token: token.id};
            }

            return {...session};
        },
    },
};
