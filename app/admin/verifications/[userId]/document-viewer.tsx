type DocumentViewerProps = {
  fileUrl: string;
  title: string;
};

// H20: el navegador muestra imágenes y PDF según el Content-Type del recurso.
// Esto también funciona con enlaces temporales que no exponen una extensión.
export function DocumentViewer({ fileUrl, title }: DocumentViewerProps) {
  return (
    <div className="flex min-h-[360px] items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
      <iframe
        src={fileUrl}
        title={title}
        className="h-[440px] w-full"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
