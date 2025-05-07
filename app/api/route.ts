import { NextResponse } from "next/server";

export const GET = async () => {
  return Response.json({ message: "Hello World" });
};

export const POST = async (req: Request) => {
  console.log(await req.json());
  return Response.json({ message: "I hate people" });
};
