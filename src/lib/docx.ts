import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun
} from 'docx';

export async function generateDOCX(
  title: string,
  resolvedContent: string
): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: new Date().toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }),
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 }
          }),
          ...resolvedContent.split('\n').map(
            (line) =>
              new Paragraph({
                children: [new TextRun({ text: line, size: 24 })],
                spacing: { after: 200 }
              })
          )
        ]
      }
    ]
  });

  return Packer.toBlob(doc);
}
