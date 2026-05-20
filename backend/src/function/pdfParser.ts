import { PDFParse } from "pdf-parse";

export async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error("PDF file is empty");
  }

  const parser = new PDFParse({ data: pdfBuffer });

  try {
    const result = await parser.getText();
    const text = result.text
      .replace(/\r/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!text) {
      throw new Error("No text could be extracted from the PDF");
    }

    return text;
  } finally {
    await parser.destroy();
  }
}
