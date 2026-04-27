import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

(pdfMake as typeof pdfMake & { vfs: unknown }).vfs = pdfFonts.pdfMake.vfs;

export function generatePDF(
  title: string,
  resolvedContent: string,
  runData: Record<string, string | number>
): Promise<Blob> {
  void runData;

  return new Promise((resolve) => {
    const docDef: TDocumentDefinitions = {
      info: { title },
      content: [
        { text: title, style: 'header' },
        { text: new Date().toLocaleDateString(), style: 'date' },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }] },
        { text: ' ' },
        { text: resolvedContent, style: 'body' }
      ],
      styles: {
        header: { fontSize: 22, bold: true, marginBottom: 4 },
        date: { fontSize: 11, color: '#888', marginBottom: 12 },
        body: { fontSize: 12, lineHeight: 1.6 }
      },
      defaultStyle: { font: 'Roboto' }
    };

    pdfMake.createPdf(docDef).getBlob((blob) => resolve(blob));
  });
}
