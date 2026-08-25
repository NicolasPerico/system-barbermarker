import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { requireRole } from "@/lib/session";
import { gerarCodigoUsuario } from "@/lib/user-code-generator";

export async function POST(request: Request) {
  try {
    const resultado = await requireRole(["dono"]);

    if (!resultado.autorizado) {
      if (resultado.motivo === "nao_autenticado") {
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

      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Você não tem permissão para cadastrar usuários.",
        },
        {
          status: 403,
        }
      );
    }

    const body = await request.json();

    const nome = body.nome;
    const email = body.email;
    const senha = body.senha;
    const papel = body.papel;

    if (
      typeof nome !== "string" ||
      typeof email !== "string" ||
      typeof senha !== "string" ||
      typeof papel !== "string"
    ) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Dados inválidos.",
        },
        {
          status: 400,
        }
      );
    }

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();

    if (!nomeLimpo || !emailLimpo || !senha) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Nome, e-mail, senha e papel são obrigatórios.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      papel !== "funcionario" &&
      papel !== "cliente"
    ) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Papel inválido.",
        },
        {
          status: 400,
        }
      );
    }

    if (senha.length < 8) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "A senha deve possuir pelo menos 8 caracteres.",
        },
        {
          status: 400,
        }
      );
    }

    const tenantId = resultado.usuario.tenant_id;

    const emailExistente = await prisma.usuarios.findFirst({
      where: {
        tenant_id: tenantId,
        email: emailLimpo,
      },
      select: {
        id: true,
      },
    });

    if (emailExistente) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: "Este e-mail já está cadastrado.",
        },
        {
          status: 409,
        }
      );
    }

    const senhaHash = await hashPassword(senha);

    const usuario = await prisma.$transaction(async (tx) => {
      const codigoUsuario = await gerarCodigoUsuario(
        tx,
        tenantId,
        papel
      );

      return tx.usuarios.create({
        data: {
          tenant_id: tenantId,
          nome: nomeLimpo,
          email: emailLimpo,
          senha_hash: senhaHash,
          papel,
          codigo_usuario: codigoUsuario,
        },
        select: {
          id: true,
          codigo_usuario: true,
          nome: true,
          email: true,
          papel: true,
          tenant_id: true,
          criado_em: true,
        },
      });
    });

    return NextResponse.json(
      {
        sucesso: true,
        usuario,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);

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