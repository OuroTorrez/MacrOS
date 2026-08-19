"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import type { ApiResult, Usuario } from "@/types";
import styles from "./Topbar.module.css";

const placeholderAvatar = "https://picsum.photos/200/300";

export default function Topbar() {
  const pathname = usePathname();
  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [section, setSection] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let lastScroll = window.scrollY;
    const onScroll = () => {
      const currentScroll = window.scrollY;
      setVisible(currentScroll <= lastScroll || currentScroll < 8);
      lastScroll = currentScroll;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pathname === "/login" || pathname.startsWith("/auth/") || pathname === "/onboarding") return;

    fetch("/api/usuarios")
      .then((response) => response.ok ? response.json() : null)
      .then((result: ApiResult<Usuario> | null) => {
        if (result && "data" in result) setPerfil(result.data ?? null);
      })
      .catch(() => undefined);
  }, [pathname]);

  if (pathname === "/login" || pathname.startsWith("/auth/") || pathname === "/onboarding") return null;

  const nombre = perfil ? `${perfil.nombre} ${perfil.apellido_paterno}` : "USUARIO";
  const avatar = perfil?.imagen_perfil || placeholderAvatar;
  const toggleSection = (name: string) => setSection((current) => current === name ? null : name);
  const cerrarSesion = async () => {
    await createSupabaseBrowser().auth.signOut();
    location.assign("/login");
  };

  return (
    <>
      <header className={`${styles.bar} ${visible ? "" : styles.hidden}`}>
        <span aria-hidden="true" />
        <Link className={styles.logo} href="/" aria-label="Ir al inicio de MacrOS"><span>M</span><small>acr</small><span>OS</span></Link>
        <button className={styles.avatarButton} type="button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú de perfil">
          <Image className={styles.avatar} src={avatar} alt="" width={64} height={64} unoptimized />
        </button>
      </header>
      <div className={styles.reservedSpace} aria-hidden="true" />

      {menuOpen && (
        <aside className={styles.panel} aria-label="Menú de perfil">
          <div className={styles.panelHeader}>
            <Image className={styles.avatarLarge} src={avatar} alt="" width={96} height={96} unoptimized />
            <div><p className={styles.panelLabel}>CUENTA</p><h2>{nombre}</h2></div>
            <button className={styles.close} type="button" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">×</button>
          </div>
          <nav className={styles.menu} aria-label="Opciones de perfil">
            <button type="button" onClick={() => toggleSection("cuenta")} aria-expanded={section === "cuenta"}>CUENTA <span>+</span></button>
            {section === "cuenta" && <div className={styles.submenu}><button type="button">Perfil</button><button type="button">Imagen de perfil</button></div>}
            <button type="button" onClick={() => toggleSection("preferencias")} aria-expanded={section === "preferencias"}>PREFERENCIAS <span>+</span></button>
            {section === "preferencias" && <div className={styles.submenu}><button type="button">Unidades</button><button type="button">Notificaciones</button></div>}
            <button className={styles.signOut} type="button" onClick={cerrarSesion}>CERRAR SESIÓN</button>
          </nav>
        </aside>
      )}
    </>
  );
}
