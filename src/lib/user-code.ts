export type PapelUsuario =
  | "dono"
  | "funcionario"
  | "cliente";

export function prefixoPorPapel(papel: PapelUsuario): string {
  switch (papel) {
    case "dono":
      return "CEO";

    case "funcionario":
      return "COL";

    case "cliente":
      return "CLI";

    default:
      throw new Error("Papel de usuário inválido.");
  }
}