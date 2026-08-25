import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import {
  generateSessionToken,
  hashSessionToken,
} from "@/lib/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body.email;
    const senha = body.senha;

    if (
      typeof email !== "string" ||
      typeof senha !== "string" ||
      !email.trim() ||
      !senha
    ) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "E-mail e senha são obrigatórios.",
        },
        {
          status: 400,
        }
      );
    }

    const usuario = await prisma.usuarios.findFirst({
      where: {
        email: email.trim().toLowerCase(),
      },
      select: {
        id: true,
        codigo_usuario: true,
        nome: true,
        email: true,
        senha_hash: true,
        papel: true,
        tenant_id: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "E-mail ou senha inválidos.",
        },
        {
          status: 401,
        }
      );
    }

    const senhaValida = await verifyPassword(
      senha,
      usuario.senha_hash
    );

    if (!senhaValida) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "E-mail ou senha inválidos.",
        },
        {
          status: 401,
        }
      );
    }

    const sessionToken = generateSessionToken();
    const tokenHash = hashSessionToken(sessionToken);

    const agora = new Date();

    const expiraEm = new Date(
      agora.getTime() + 1000 * 60 * 60 * 24 * 7
    );

    await prisma.sessoes.create({
      data: {
        usuario_id: usuario.id,
        token_hash: tokenHash,
        criado_em: agora,
        expira_em: expiraEm,
      },
    });

    const response = NextResponse.json({
      sucesso: true,
      usuario: {
        codigo_usuario: usuario.codigo_usuario,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        tenant_id: usuario.tenant_id,
      },
    });

    response.cookies.set({
      name: "session_token",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiraEm,
    });

    return response;
  } catch (error) {
    console.error("Erro no login:", error);

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