"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthProvider";

import LogoBase64 from "@/public/logo/LogoBase64";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Spinner = () => (
  <div className="border border-solid border-[#f3f3f3] border-t-[#e82a31] rounded-[100%] w-6 h-6 animate-spin" />
);

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: "top-center",
      });
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(username, password);

      if (!result.success) {
        setError(result.error || "Error");
      }
    } catch {
      setError("Error");
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

          <div className="flex flex-col gap-1.25 h-1/3">
            <label
              htmlFor="password"
              className="flex font-semibold text-[17px] tracking-[0.5px]"
            >
              Introduzca su contraseña
            </label>
            <input
              className="bg-background2 p-1 rounded w-full h-2/3 flex items-center justify-center border-none px-4"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            className="bg-[#e82a31] mt-1.25 p-1 rounded w-full h-13 flex items-center justify-center border-none font-semibold cursor-pointer disabled:bg-[#a82328] disabled:cursor-not-allowed text-white"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? <Spinner /> : "Acceder"}
          </Button>
        </form>

        <Link
          className="w-full flex text-center justify-center text-[#5d5d5d] h-auto text-[14px] font-semibold tracking-[0.5px] cursor-pointer hover:text-[#e82a31] ease-in-out"
          href="/login/recuperacion"
        >
          Recuperar contraseña
        </Link>
      </div>
    </section>
  );
};

export default Login;
