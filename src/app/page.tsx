"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const resposta = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          senha,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(
          dados.mensagem ||
            "Não foi possível realizar o login."
        );
        return;
      }

      if (dados.usuario?.nivel_acesso === "sistema") {
        router.push("/admin");
        return;
      }

      router.push("/admin");
    } catch {
      setErro("Erro de comunicação com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-page">
      {/* TESOURAS DO FUNDO */}
      <div
        className="scissors-background"
        aria-hidden="true"
      >
        <div className="scissor scissor-top">
          <span>✂</span>
        </div>

        <div className="scissor scissor-top">
          <span>✂</span>
        </div>

        <div className="scissor scissor-top">
          <span>✂</span>
        </div>

        <div className="scissor scissor-top">
          <span>✂</span>
        </div>

        <div className="scissor scissor-top">
          <span>✂</span>
        </div>

        <div className="scissor scissor-bottom">
          <span>✂</span>
        </div>

        <div className="scissor scissor-bottom">
          <span>✂</span>
        </div>

        <div className="scissor scissor-bottom">
          <span>✂</span>
        </div>

        <div className="scissor scissor-bottom">
          <span>✂</span>
        </div>

        <div className="scissor scissor-bottom">
          <span>✂</span>
        </div>
      </div>

      {/* CARD DO LOGIN */}
      <section className="login-card">
        {/* LOGO */}
        <div className="login-brand-logo">
          <img
            src="/logo.png"
            alt="BarberMaker"
          />
        </div>

        {/* FORMULÁRIO */}
        <form
          onSubmit={handleLogin}
          className="login-form"
        >
          {/* E-MAIL */}
          <div className="field">
            <label htmlFor="email">
              E-mail
            </label>

            <div className="input-wrap">
              <span className="input-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />

                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>

              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>
          </div>

          {/* SENHA */}
          <div className="field">
            <label htmlFor="senha">
              Senha
            </label>

            <div className="input-wrap">
              <span className="input-icon">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                  />

                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
              </span>

              <input
                id="senha"
                type={
                  mostrarSenha
                    ? "text"
                    : "password"
                }
                placeholder="Digite sua senha"
                value={senha}
                onChange={(event) =>
                  setSenha(event.target.value)
                }
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setMostrarSenha(!mostrarSenha)
                }
                aria-label={
                  mostrarSenha
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
              >
                {mostrarSenha ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3l18 18" />

                    <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />

                    <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9 5 9 5a16 16 0 0 1-2.1 2.7" />

                    <path d="M6.6 6.6C4.4 8 3 10 3 10s3.5 5 9 5c1 0 1.9-.2 2.7-.4" />
                  </svg>
                ) : (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />

                    <circle
                      cx="12"
                      cy="12"
                      r="2.5"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* ERRO */}
          {erro && (
            <div className="login-error">
              {erro}
            </div>
          )}

          {/* BOTÃO */}
          <button
            type="submit"
            className="login-button"
            disabled={carregando}
          >
            {carregando
              ? "Entrando..."
              : "Entrar"}
          </button>
        </form>
      </section>

      {/* RODAPÉ */}
      <footer className="page-footer">
        © 2026 BarberMaker
      </footer>
    </main>
  );
}
