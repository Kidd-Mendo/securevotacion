
export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Página no encontrada</h1>
        <p className="text-muted-foreground mb-4">La página que buscas no existe</p>
        <a 
          href="/" 
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}
