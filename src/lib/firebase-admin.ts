// src/lib/firebase-admin.ts - 100% Server-Safe Mock
export function getAdminDb() {
  return {
    collection: (name: string) => ({
      doc: (id: string) => ({
        get: async () => ({ exists: false }),
        update: async () => true,
        set: async () => true,
        collection: (sub: string) => ({
            get: async () => ({ docs: [] })
        })
      }),
      where: () => ({
        orderBy: () => ({
          limit: () => ({
            get: async () => ({ docs: [] })
          })
        }),
        get: async () => ({ docs: [], size: 0 })
      }),
      orderBy: () => ({
          limit: () => ({
            get: async () => ({ docs: [] })
          })
      })
    })
  }
}

export function getAdminAuth() {
    return {
        // Mock auth methods if needed
    }
}
