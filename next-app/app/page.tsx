import LandingPage from "@/components/landing/page";
import auth from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  // access session in server component
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;

  if (session && userId) {
    redirect("/chat");
  }

  return <LandingPage />;
}

// Sample loading.ts
// export default function Loading() {
//   return (
//     <div className="flex h-screen items-center justify-center">
//       <div className="text-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
//         <p className="text-muted-foreground">Just a moment...</p>
//       </div>
//     </div>
//   );
// }
