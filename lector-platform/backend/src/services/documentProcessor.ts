// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PDFParse } = require('pdf-parse')

/**
 * Extract text from a PDF buffer using pdf-parse v2.
 * PDFParse constructor accepts LoadParameters; pass { data: buffer }.
 * getText() returns a TextResult with a .text string property.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const parser = new PDFParse({ data: buffer })
    const result = await parser.getText()
    // TextResult has a .text property (concatenated text from all pages)
    return (result?.text as string) ?? ''
  } catch (err) {
    console.error('PDF extraction error:', err)
    return ''
  }
}

/**
 * Extract text from a PPTX/PPT buffer using officeparser.
 * Falls back to manual XML extraction if officeparser fails.
 */
export async function extractTextFromPPTX(buffer: Buffer): Promise<string> {
  // officeparser v6 returns an object with a toText() method, not a plain string.
  // It also needs a file path (not a buffer) to detect the file type correctly.
  // Write to a temp file with .pptx extension so officeparser can identify it.
  const os = require('os')
  const path = require('path')
  const fs = require('fs')
  const tmpPath = path.join(os.tmpdir(), `lector_${Date.now()}.pptx`)

  try {
    fs.writeFileSync(tmpPath, buffer)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const officeparser = require('officeparser')
    const result = await officeparser.parseOffice(tmpPath)
    // v6 returns an object with toText() method
    const text: string = typeof result === 'string'
      ? result
      : (typeof result?.toText === 'function' ? result.toText() : String(result ?? ''))
    if (text && text.trim().length > 0) return text
  } catch (err) {
    console.error('officeparser error:', err)
  } finally {
    try { require('fs').unlinkSync(tmpPath) } catch { /* ignore cleanup error */ }
  }

  // Fallback: manually extract text from PPTX XML (PPTX is a ZIP of XML files)
  return extractTextFromPPTXManual(buffer)
}

/**
 * Manual PPTX text extraction by parsing the ZIP structure.
 * PPTX files are ZIP archives containing XML slide files.
 */
function extractTextFromPPTXManual(buffer: Buffer): string {
  try {
    const texts: string[] = []
    const buf = buffer

    // ZIP local file header signature: PK\x03\x04
    let offset = 0
    while (offset < buf.length - 4) {
      // Find next local file header
      if (buf[offset] === 0x50 && buf[offset + 1] === 0x4b &&
          buf[offset + 2] === 0x03 && buf[offset + 3] === 0x04) {

        const compressionMethod = buf.readUInt16LE(offset + 8)
        const compressedSize = buf.readUInt32LE(offset + 18)
        const fileNameLength = buf.readUInt16LE(offset + 26)
        const extraFieldLength = buf.readUInt16LE(offset + 28)
        const fileName = buf.slice(offset + 30, offset + 30 + fileNameLength).toString('utf8')

        const dataOffset = offset + 30 + fileNameLength + extraFieldLength

        // Only process slide XML files (ppt/slides/slide*.xml)
        if (fileName.match(/ppt\/slides\/slide\d+\.xml/) && compressionMethod === 0) {
          const xmlData = buf.slice(dataOffset, dataOffset + compressedSize).toString('utf8')
          // Extract text from <a:t> tags (DrawingML text elements)
          const matches = xmlData.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) ?? []
          for (const match of matches) {
            const text = match.replace(/<[^>]+>/g, '').trim()
            if (text) texts.push(text)
          }
        }

        offset = dataOffset + compressedSize
      } else {
        offset++
      }
    }

    return texts.join(' ')
  } catch {
    return ''
  }
}

/**
 * Split text into overlapping chunks.
 * @param text       Full document text
 * @param chunkSize  Target characters per chunk (default 1000)
 * @param overlap    Overlap between consecutive chunks (default 200)
 */
export function chunkText(
  text: string,
  chunkSize = 1000,
  overlap = 200
): string[] {
  if (!text || text.trim().length === 0) return []

  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    chunks.push(text.slice(start, end))
    if (end === text.length) break
    start += chunkSize - overlap
  }

  return chunks
}
