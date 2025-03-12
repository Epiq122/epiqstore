import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/db/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compareSync } from 'bcrypt-ts-edge';
import { authConfig } from './auth.config';

export const config = {
  pages: {
    signIn: '/signin',
    error: '/signin',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (credentials === null) return null;

        // Check if user exists
        const user = await prisma.user.findFirst({
          where: { email: credentials.email as string },
        });

        // check if user exists and password is correct
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password,
          );

          // if password is correct return user
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        // if user not found or password is incorrect return to null
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, user, trigger, token }: any) {
      // set the user ID from the token
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;
      // if there is an update set the user name
      if (trigger === 'update') {
        session.user.name = user.name;
      }

      return session;
    },
    async jwt({ token, user }: any) {
      // assign user fields to the token
      if (user) {
        token.role = user.role;

        // if user has no name then  use email
        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0];

          // update the db with the new name
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }
      }
      return token;
    },
    ...authConfig.callbacks,
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
