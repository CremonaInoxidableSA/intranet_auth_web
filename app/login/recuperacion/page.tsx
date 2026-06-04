"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import LogoBase64 from "@/public/logo/LogoBase64";
import { Button } from "@/components/ui/button";

const Spinner = () => (
  <div className="border border-solid border-[#f3f3f3] border-t-[#e82a31] rounded-[100%] w-6 h-6 animate-spin" />
);

const Recuperacion = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/proxy/auth/recuperacion_check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Correo enviado correctamente");
      } else {
        toast.error(data.error || data.message || "Error al enviar el correo");
      }
    } catch (err) {
      toast.error(`Error de conexión con el servidor: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex h-full w-full items-center justify-center">
      <div className="w-auto h-[60vh] gap-3.75 flex flex-col items-center p-[3rem_4rem_2rem_4rem] max-w-480  bg-backgroundoscuro rounded">
        <LogoBase64 className="flex w-[65%] p-0 h-auto" />

        <form
          className="flex flex-col w-full justify-between h-[60%] gap-2.5"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1.25 h-1/3">
            <label
              htmlFor="email"
              className="flex font-semibold text-[17px] tracking-[0.5px]"
            >
              Introduzca su correo electrónico
            </label>
            <input
              className="bg-background2 p-1 rounded w-full h-2/3 flex items-center justify-center border-none px-4"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.25 h-1/3">
            <label
              htmlFor="email"
              className="flex font-semibold text-[17px] tracking-[0.5px]"
            >
              Introduzca su usuario
            </label>
            <input
              className="bg-background2 p-1 rounded w-full h-2/3 flex items-center justify-center border-none px-4"
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <Button
            disabled={loading}
            onClick={handleSubmit}
            className="bg-[#e82a31] mt-1.25 p-1 rounded w-full h-13 flex items-center justify-center border-none font-semibold cursor-pointer disabled:bg-[#a82328] disabled:cursor-not-allowed text-white"
          >
            {loading ? <Spinner /> : "Enviar correo de recuperación"}
          </Button>
        </form>

        <Link
          className="w-full flex text-center justify-center text-[#5d5d5d] h-auto text-[14px] font-semibold tracking-[0.5px] cursor-pointer hover:text-[#e82a31] ease-in-out"
          href="/login"
        >
          Iniciar sesión
        </Link>
      </div>
    </section>
  );
};

export default Recuperacion;
