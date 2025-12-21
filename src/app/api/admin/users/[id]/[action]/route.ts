import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';

// Secure admin verification using Firebase ID Token
async function verifyAdmin(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    console.warn("API request missing 'Authorization' Bearer token.");
    return null;
  }

  const idToken = authHeader.slice(7);
  try {
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Additionally check the user's role in Firestore
    const db = getAdminDb();
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      console.warn(`Admin action attempted by non-existent user: ${uid}`);
      return null;
    }

    const role = userDoc.data()?.role;
    if (role !== 'admin' && role !== 'moderator') {
      console.warn(`Admin action attempted by user ${uid} with role '${role}'.`);
      return null;
    }
    return uid;
  } catch (error) {
    console.error('Auth token verification failed:', error);
    return null;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  const { id: targetUserId, action } = await params;

  const adminUid = await verifyAdmin(request);
  if (!adminUid) {
    return NextResponse.json({ error: 'Unauthorized: Admin or moderator access required.' }, { status: 403 });
  }

  if (adminUid === targetUserId) {
    return NextResponse.json({ error: 'Admin cannot perform actions on themselves.' }, { status: 400 });
  }

  const db = getAdminDb();
  const auth = getAdminAuth();

  try {
    const userRef = db.collection('users').doc(targetUserId);

    let message = '';
    let payload: any = {};

    switch (action) {
      case 'set-role': {
        const body = await request.json();
        const { role } = body;
        payload = { role };

        if (!role || !['user', 'moderator', 'admin'].includes(role)) {
          return NextResponse.json({ error: 'Invalid role specified.' }, { status: 400 });
        }

        await userRef.update({ role });
        message = `User role updated to ${role}.`;
        break;
      }

      case 'ban': {
        await userRef.update({ status: 'banned' });
        await auth.updateUser(targetUserId, { disabled: true });
        message = 'User has been banned.';
        break;
      }

      case 'unban': {
        await userRef.update({ status: 'active' });
        await auth.updateUser(targetUserId, { disabled: false });
        message = 'User has been unbanned.';
        break;
      }

      default:
        return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
    }

    await db.collection('moderationActions').add({
      adminId: adminUid,
      action,
      targetUserId,
      payload: payload || null,
      createdAt: Timestamp.now(),
    });

    revalidatePath('/admin/users');
    revalidatePath(`/profile/${targetUserId}`);

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error(`Admin action '${action}' on user '${targetUserId}' failed:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
