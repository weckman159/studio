/**
 * Firestore Client - клиентская утилита для работы с Firestore через прокси
 * 
 * Использует /api/firestore-proxy для обхода блокировщиков рекламы
 * 
 * Пример использования:
 * ```ts
 * const posts = await firestoreClient.getCollection('posts', {
 *   where: [['status', '==', 'published']],
 *   orderBy: ['createdAt', 'desc'],
 *   limit: 10
 * });
 * ```
 */

interface QueryParams {
  where?: [string, any, any][];
  orderBy?: [string, 'asc' | 'desc'];
  limit?: number;
}

export const firestoreClient = {
  /**
   * Получить документ по ID
   */
  async getDocument(collection: string, documentId: string) {
    const response = await fetch('/api/firestore-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'getDocument',
        collection,
        documentId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get document: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Получить коллекцию документов с фильтрами
   */
  async getCollection(collection: string, queryParams?: QueryParams) {
    const response = await fetch('/api/firestore-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'getCollection',
        collection,
        queryParams
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to get collection: ${response.statusText}`);
    }

    const data = await response.json();
    return data.documents;
  },

  /**
   * Создать или обновить документ
   */
  async setDocument(collection: string, documentId: string, data: any, merge = false) {
    const response = await fetch('/api/firestore-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'setDocument',
        collection,
        documentId,
        data,
        queryParams: { merge }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to set document: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Обновить существующий документ
   */
  async updateDocument(collection: string, documentId: string, data: any) {
    const response = await fetch('/api/firestore-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'updateDocument',
        collection,
        documentId,
        data
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update document: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Удалить документ
   */
  async deleteDocument(collection: string, documentId: string) {
    const response = await fetch('/api/firestore-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'deleteDocument',
        collection,
        documentId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Добавить новый документ с автоматической генерацией ID
   */
  async addDocument(collection: string, data: any) {
    const response = await fetch('/api/firestore-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'addDocument',
        collection,
        data
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to add document: ${response.statusText}`);
    }

    return response.json();
  }
};
