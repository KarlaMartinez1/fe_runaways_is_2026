type DocumentViewerProps = {
  fileUrl: string;
  title: string;
};

// El archivo puede ser imagen o PDF. Se detecta por el tipo del data URL o por la extensión.
function isPdf(url: string) {
  return url.startsWith("data:application/pdf") || /\.pdf($|\?)/i.test(url);
}

// H20: visor del documento (imagen o PDF) en la revisión del ADMIN.
export function DocumentViewer({ fileUrl, title }: DocumentViewerProps) {
  return (
    <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
      {isPdf(fileUrl) ? (
        <iframe src={fileUrl} title={title} className="h-[560px] w-full" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={fileUrl} alt={title} className="max-h-[560px] w-full object-contain" />
      )}
    </div>
  );
}