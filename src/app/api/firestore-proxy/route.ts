import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

/**
 * Firestore Proxy API - обходит блокировщики рекламы
 * 
 * Этот endpoint работает как прокси между клиентом и Firestore,
 * обходя блокировки firestore.googleapis.com
 */

export async function POST(request: Request) {
  try {
    const { operation, collection, documentId, data, queryParams } = await request.json();
    const db = getAdminDb();

    switch (operation) {
      case 'getDocument': {
        const docRef = db.collection(collection).doc(documentId);
        const doc = await docRef.get();
        
        if (!doc.exists) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }
        
        return NextResponse.json({
          id: doc.id,
          data: doc.data(),
          exists: true
        });
      }

      case 'getCollection': {
        let query: any = db.collection(collection);
        
        // Применяем фильтры если есть
        if (queryParams?.where) {
          for (const [field, operator, value] of queryParams.where) {
            query = query.where(field, operator, value);
          }
        }
        
        // Применяем сортировку
        if (queryParams?.orderBy) {
          const [field, direction = 'asc'] = queryParams.orderBy;
          query = query.orderBy(field, direction);
        }
        
        // Применяем лимит
        if (queryParams?.limit) {
          query = query.limit(queryParams.limit);
        }
        
        const snapshot = await query.get();
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        }));
        
        return NextResponse.json({ documents });
      }

      case 'setDocument': {
        const docRef = db.collection(collection).doc(documentId);
        await docRef.set(data, { merge: queryParams?.merge || false });
        
        return NextResponse.json({ success: true, id: documentId });
      }

      case 'updateDocument': {
        const docRef = db.collection(collection).doc(documentId);
        await docRef.update(data);
        
        return NextResponse.json({ success: true, id: documentId });
      }

      case 'deleteDocument': {
        const docRef = db.collection(collection).doc(documentId);
        await docRef.delete();
        
        return NextResponse.json({ success: true, id: documentId });
      }

      case 'addDocument': {
        const collectionRef = db.collection(collection);
        const docRef = await collectionRef.add(data);
        
        return NextResponse.json({ success: true, id: docRef.id });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid operation' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Firestore proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
