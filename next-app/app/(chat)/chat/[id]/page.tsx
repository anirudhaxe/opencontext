import Chat from "@/components/Chat";
import { trpc } from "@/trpc/server";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const initialMessages = await trpc.chat.loadChat({ chatId: id });

  return <Chat id={id} initialMessages={initialMessages} />;
}
