import { api } from './api'
import type { UploadResponse } from '../types'

export const uploadService = {
  enviarArquivo(file: File) {
    const formData = new FormData()
    formData.append('file', file)

    return api.post<UploadResponse>('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
