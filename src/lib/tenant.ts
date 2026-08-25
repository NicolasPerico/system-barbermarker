import { prisma } from "@/lib/prisma";

export async function withTenant<T>(
  tenantId: string,
  callback: (tx: any) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      SELECT set_config(
        'app.tenant_id',
        ${tenantId},
        true
      )
    `;

    return callback(tx);
  });
}