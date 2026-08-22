import {
  adminArmed,
  attachGoogleState,
  googleAuthorizeUrl,
  mintGoogleState,
  originFrom,
} from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const origin = originFrom(request);
  if (!adminArmed()) {
    return NextResponse.redirect(new URL("/?log=unarmed", origin));
  }
  const state = mintGoogleState();
  const response = NextResponse.redirect(googleAuthorizeUrl(origin, state));
  attachGoogleState(response, state);
  return response;
}
