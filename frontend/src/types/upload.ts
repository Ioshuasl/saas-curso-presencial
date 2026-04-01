export type UploadResponse = {
  tenant_id?: number
  url: string
  key?: string
  filename: string
  originalname: string
  size: number
  mimetype: string
}
