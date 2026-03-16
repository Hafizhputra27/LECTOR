import { create } from 'zustand'

export interface Document {
  id: string
  userId: string
  fileName: string
  fileType: 'pdf' | 'ppt' | 'pptx'
  fileSize: number
  pageCount?: number
  uploadedAt: Date
  status: 'processing' | 'ready' | 'error'
  storagePath: string
}

interface DocumentState {
  documents: Document[]
  activeDocument: Document | null
  isLoading: boolean
  setDocuments: (documents: Document[]) => void
  setActiveDocument: (document: Document | null) => void
  addDocument: (document: Document) => void
  removeDocument: (id: string) => void
  updateDocumentStatus: (id: string, status: Document['status']) => void
  setLoading: (loading: boolean) => void
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  activeDocument: null,
  isLoading: false,
  setDocuments: (documents) => set({ documents }),
  setActiveDocument: (activeDocument) => set({ activeDocument }),
  addDocument: (document) =>
    set((state) => ({ documents: [document, ...state.documents] })),
  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
      activeDocument: state.activeDocument?.id === id ? null : state.activeDocument,
    })),
  updateDocumentStatus: (id, status) =>
    set((state) => ({
      documents: state.documents.map((d) => (d.id === id ? { ...d, status } : d)),
    })),
  setLoading: (isLoading) => set({ isLoading }),
}))
