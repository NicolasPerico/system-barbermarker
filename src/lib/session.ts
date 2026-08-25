import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export async function getAuthenticatedUser(token: string) {
  const tokenHash = hashSessionToken(token);

  const sessao = await prisma.sessoes.findUnique({
    where: {
      token_hash: tokenHash,
    },
    select: {
      id: true,
      expira_em: true,
      revogada_em: true,
      usuarios: {
        select: {
          id: true,
          codigo_usuario: true,
          nome: true,
          email: true,
          papel: true,
          tenant_id: true,
        },
      },
    },
  });

  if (!sessao) {
    return null;
  }

  if (sessao.revogada_em) {
    return null;
  }

  if (sessao.expira_em <= new Date()) {
    return null;
  }

  return sessao.usuarios;
}

export async function requireAuth() {
  const cookieStore = await cookies();

  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) {
    return null;
  }

  return getAuthenticatedUser(sessionToken);
}

export async function requireRole(
  papeisPermitidos: Array<"dono" | "funcionario" | "cliente">
) {
  const usuario = await requireAuth();

  if (!usuario) {
    return {
      autorizado: false as const,
      motivo: "nao_autenticado" as const,
    };
  }

  if (!papeisPermitidos.includes(usuario.papel)) {
    return {
      autorizado: false as const,
      motivo: "sem_permissao" as const,
      usuario,
    };
  }

  return {
    autorizado: true as const,
    usuario,
  };
}