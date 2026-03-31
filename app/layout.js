export const metadata = {
  title: "Sistema Prescripción Tributaria",
  description: "Generador de demandas de prescripción extintiva",
};
 
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, background: "#010409" }}>{children}</body>
    </html>
  );
}
