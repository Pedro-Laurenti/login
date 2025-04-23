import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Início • Psicologia Católica Tomista",
    description: "Bem-vindo ao site oficial da Psicologia Católica Tomista, onde você encontra informações e recursos sobre a integração da psicologia com os princípios da filosofia tomista.",
};

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <div>
        {children}
    </div>
  );
}
