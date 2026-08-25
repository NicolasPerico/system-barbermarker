import { prefixoPorPapel, PapelUsuario } from "@/lib/user-code";

export async function gerarCodigoUsuario(
  tx: {
    $queryRaw: <T>(
      query: TemplateStringsArray,
      ...values: unknown[]
    ) => Promise<T>;
  },
  tenantId: string,
  papel: PapelUsuario
): Promise<string> {
  const resultado = await tx.$queryRaw<
    { ultimo_numero: bigint }[]
  >`
    INSERT INTO tenant_user_counters (
      tenant_id,
      papel,
      ultimo_numero
    )
    VALUES (
      ${tenantId}::uuid,
      ${papel}::papel_usuario,
      1
    )
    ON CONFLICT (tenant_id, papel)
    DO UPDATE SET
      ultimo_numero =
        tenant_user_counters.ultimo_numero + 1
    RETURNING ultimo_numero;
  `;

  const numero = resultado[0].ultimo_numero;

  const prefixo = prefixoPorPapel(papel);

  return `${prefixo}-${numero.toString().padStart(6, "0")}`;
}