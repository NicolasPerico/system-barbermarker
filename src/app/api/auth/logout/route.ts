import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashSessionToken } from "@/lib/session";

export async function POST() {
  try {
    const cookieStore = await cookies();

    const sessionToken = cookieStore.get("session_token")?.value;

    if (sessionToken) {
      const tokenHash = hashSessionToken(sessionToken);

      await prisma.sessoes.updateMany({
        where: {
          token_hash: tokenHash,
          revogada_em: null,
        },
        data: {
          revogada_em: new Date(),
        },
      });
    }

    const response = NextResponse.json({
      sucesso: true,
      mensagem: "Logout realizado com sucesso.",
    });

    response.cookies.set({
      name: "session_token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Erro no logout:", error);

    return NextResponse.json(
      {
        sucesso: false,
        mensagem: "Erro interno do servidor.",
      },
      {
        status: 500,
      }
    );
  }
}