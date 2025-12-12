
import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';
import { serializeFirestoreData } from '@/lib/utils';
import { Notification } from '@/lib/types';
import { DecodedIdToken } from 'firebase-admin/auth';

async function verifyAuth(request: NextRequest): Promise<DecodedIdToken | null> {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        console.warn("API request missing 'Authorization' Bearer token.");
        return null;
    }
    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) {
        return null;
    }
    try {
        const auth = getAdminAuth();
        return await auth.verifyIdToken(idToken);
    } catch (error) {
        console.error('Auth token verification failed:', error);
        return null;
    }
}

export async function GET(request: NextRequest) {
    const decodedToken = await verifyAuth(request);

    if (!decodedToken) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const db = getAdminDb();
        const notificationsQuery = db.collection('notifications')
            .where('recipientId', '==', decodedToken.uid)
            .orderBy('createdAt', 'desc')
            .limit(20);
        
        const snapshot = await notificationsQuery.get();
        
        if (snapshot.empty) {
            return NextResponse.json([]);
        }

        const notifications = snapshot.docs.map(doc => 
            serializeFirestoreData({ id: doc.id, ...doc.data() }) as Notification
        );

        return NextResponse.json(notifications);

    } catch (error) {
        console.error('Error fetching notifications via API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
