"use client";

import { ThemeSwitcher } from "@/components/theme/themeSwitcher";
import UserIcon from "@/components/userIcon/userIcon";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

import Logo from "@/public/logo/creminox_innovate.webp";
import { Menu, X } from "lucide-react";

export default function HeaderPrincipal() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="flex bg-headerbg -header p-5 items-center">
        {/* Desktop: iconos izquierda */}
        <div className="hidden xl:flex flex-row h-full w-[30%] justify-start gap-5 items-center">
          <UserIcon />
          <ThemeSwitcher />
          <Link href="/">Inicio</Link>
        </div>

        {/* Mobile: hamburger izquierda */}
        <div className="flex xl:hidden items-center">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
            className="cursor-pointer flex items-center justify-center"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Título centrado */}
        <p className="flex flex-1 xl:w-[40%] justify-center header font-bold">
          Intranet General de Trabajo Cremona Inoxidable S.A.
        </p>

        {/* Desktop: links + logo */}
        <div className="hidden xl:flex flex-row w-[30%] justify-end">
          <ul className="flex flex-row w-full h-full gap-7.5 justify-end items-center">
            <Link
              href="https://creminox.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Image
                src={Logo}
                alt="Creminox logo"
                className="h-6 w-auto"
                priority
                loading="eager"
              />
            </Link>
          </ul>
        </div>

        {/* Mobile: logo derecha */}
        <div className="flex xl:hidden items-center">
          <Link
            href="https://creminox.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            <Image
              src={Logo}
              alt="Creminox logo"
              className="h-6 w-auto"
              priority
              loading="eager"
            />
          </Link>
        </div>
      </header>

      {/* Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 xl:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer lateral izquierdo */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-headerbg -header z-50 xl:hidden flex flex-col transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Fila superior: perfil + theme + cerrar */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-current/20">
          <div className="flex items-center gap-4">
            <UserIcon />
            <ThemeSwitcher />
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Cerrar menú"
            className="cursor-pointer flex items-center justify-center"
          >
            <X size={22} />
          </button>
        </div>

        {/* Links de navegación */}
        <nav className="flex flex-col px-4 py-5 gap-5">
          <Link
            href="/"
            className="opacity-70 hover:opacity-100 transition-opacity text-base"
            onClick={() => setDrawerOpen(false)}
          >
            Home
          </Link>
          <Link
            href="http://192.168.20.198:3001"
            className="opacity-70 hover:opacity-100 transition-opacity text-base"
            onClick={() => setDrawerOpen(false)}
          >
            Control AutoDesk
          </Link>
        </nav>
      </div>
    </>
  );
}
