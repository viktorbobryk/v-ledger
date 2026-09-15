# V Ledger

Next.js app with Tailwind and Supabase (Postgres).

## Getting Started

```bash
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Copy `.env.example` to `.env.local` and paste the project URL plus publishable key from the [Supabase dashboard](https://supabase.com/dashboard). Set the Auth site URL to `http://localhost:3000`. Email/password login is on `/login`; if confirmation is enabled, confirm from the email or turn it off under Authentication → Providers → Email.

You can start editing the page by modifying `src/app/page.tsx`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
