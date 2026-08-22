import {
  adminMailbox,
  attachAuthorSession,
  exchangeGoogleCode,
  googleStateMatches,
  originFrom,
} from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const origin = originFrom(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code") ?? "";
  const state = url.searchParams.get("state") ?? "";
  const denied = url.searchParams.get("error");

  if (denied || !code || !(await googleStateMatches(state))) {
    return NextResponse.redirect(new URL("/?log=denied", origin));
  }

  const email = await exchangeGoogleCode(origin, code);
  if (!email || email !== adminMailbox()) {
    return NextResponse.redirect(new URL("/?log=denied", origin));
  }

  const response = NextResponse.redirect(new URL("/?log=1", origin));
  attachAuthorSession(response);
  return response;
}
