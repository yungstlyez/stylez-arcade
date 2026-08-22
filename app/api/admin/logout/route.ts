import { clearAuthorSession } from "@/lib/admin-auth";

export async function POST() {
  await clearAuthorSession();
  return Response.json({ message: "SIGNED OUT." });
}
