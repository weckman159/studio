import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Firestore Proxy API Route
 * Provides server-side Firestore operations using Firebase Admin SDK
 * This is useful when you need to bypass security rules for admin operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, collection, documentId, data, queryParams } = body;

    const adminDb = getAdminDb();

    switch (operation) {
      case 'getDocument': {
        if (!collection || !documentId) {
          return NextResponse.json(
            { error: 'Missing collection or documentId' },
            { status: 400 }
          );
        }

        const docRef = adminDb.collection(collection).doc(documentId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
          return NextResponse.json(
            { error: 'Document not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          id: docSnap.id,
          ...docSnap.data(),
        });
      }

      case 'getCollection': {
        if (!collection) {
          return NextResponse.json(
            { error: 'Missing collection' },
            { status: 400 }
          );
        }

        let query: any = adminDb.collection(collection);

        // Apply filters if provided
        if (queryParams) {
          if (queryParams.where) {
            const { field, operator, value } = queryParams.where;
            query = query.where(field, operator, value);
          }

          if (queryParams.orderBy) {
            const { field, direction = 'asc' } = queryParams.orderBy;
            query = query.orderBy(field, direction);
          }

          if (queryParams.limit) {
            query = query.limit(queryParams.limit);
          }
        }

        const snapshot = await query.get();
        const documents = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
        }));

        return NextResponse.json({ documents });
      }

      case 'setDocument': {
        if (!collection || !documentId || !data) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        const docRef = adminDb.collection(collection).doc(documentId);
        const options = queryParams?.merge ? { merge: true } : {};
        
        await docRef.set(data, options);

        return NextResponse.json({
          success: true,
          id: documentId,
        });
      }

      case 'updateDocument': {
        if (!collection || !documentId || !data) {
          return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
        }

        const docRef = adminDb.collection(collection).doc(documentId);
        await docRef.update(data);

        return NextResponse.json({
          success: true,
          id: documentId,
        });
      }

      case 'deleteDocument': {
        if (!collection || !documentId) {
          return NextResponse.json(
            { error: 'Missing collection or documentId' },
            { status: 400 }
          );
        }

        const docRef = adminDb.collection(collection).doc(documentId);
        await docRef.delete();

        return NextResponse.json({
          success: true,
          id: documentId,
        });
      }

      case 'addDocument': {
        if (!collection || !data) {
          return NextResponse.json(
            { error: 'Missing collection or data' },
            { status: 400 }
          );
        }

        const collectionRef = adminDb.collection(collection);
        const docRef = await collectionRef.add(data);

        return NextResponse.json({
          success: true,
          id: docRef.id,
        });
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
