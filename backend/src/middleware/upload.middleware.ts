import multer from 'multer'

const storage = multer.memoryStorage()

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

// Magic bytes for each allowed format
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/jpg':  [[0xFF, 0xD8, 0xFF]],
  'image/png':  [[0x89, 0x50, 0x4E, 0x47]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
}

function checkMagicBytes(buffer: Buffer, mimetype: string): boolean {
  const signatures = MAGIC_BYTES[mimetype]
  if (!signatures) return false
  return signatures.some(sig => sig.every((byte, i) => buffer[i] === byte))
}

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const ext = '.' + file.originalname.split('.').pop()?.toLowerCase()
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
    cb(new Error('Only JPEG, PNG and WebP images are allowed'))
    return
  }
  cb(null, true)
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
})

// Post-upload magic bytes check — call after multer processes the file
export function validateMagicBytes(file: Express.Multer.File): boolean {
  return checkMagicBytes(file.buffer, file.mimetype)
}