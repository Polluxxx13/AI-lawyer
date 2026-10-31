function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export async function exportPdf(text: string, filename = "plaidoyer.pdf") {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 25;
  const width = 210 - margin * 2;
  const bottom = 297 - margin;
  doc.setFont("times", "normal");
  doc.setFontSize(11.5);
  const lineH = 6;
  let y = margin;
  for (const para of text.split("\n")) {
    const lines: string[] = para.trim() === "" ? [""] : doc.splitTextToSize(para, width);
    for (const line of lines) {
      if (y > bottom) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineH;
    }
  }
  doc.save(filename);
}

export async function exportWord(text: string, filename = "plaidoyer.docx") {
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import("docx");
  const paragraphs = text.split("\n").map(
    (line) =>
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 160, line: 300 },
        children: [new TextRun({ text: line, font: "Times New Roman", size: 24 })],
      }),
  );
  const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
  download(await Packer.toBlob(doc), filename);
}
