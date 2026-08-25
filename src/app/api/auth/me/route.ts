import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthenticatedUser } from "@/lib/session";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const sessionToken = cookieStore.get("session_token")?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Não autenticado.",
        },
        {
          status: 401,
        }
      );
    }

    const usuario = await getAuthenticatedUser(sessionToken);

    if (!usuario) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Sessão inválida ou expirada.",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      sucesso: true,
      usuario: {
        id: usuario.id,
        codigo_usuario: usuario.codigo_usuario,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
        tenant_id: usuario.tenant_id,
      },
    });
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);

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