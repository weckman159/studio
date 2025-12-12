

import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';

async function verifyAdmin(request: NextRequest): Promise<string | null> {
    // WARNING: This is a temporary auth check for the MVP.
    // In production, you must verify a JWT from the Authorization header.
    const adminUid = request.headers.get('x-user-id');
    if (!adminUid) {
        console.warn("API request missing 'x-user-id' header.");
        return null;
    }

    try {
        const db = getAdminDb();
        const adminUserDoc = await db.collection('users').doc(adminUid).get();

        if (!adminUserDoc.exists || adminUserDoc.data()?.role !== 'admin') {
            console.warn(`Admin action attempted by non-admin or non-existent user: ${adminUid}`);
            return null;
        }
        return adminUid;
    } catch (error) {
        console.error("Admin verification failed:", error);
        return null;
    }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string; action: string; } }
) {
    const adminUid = await verifyAdmin(request);
    if (!adminUid) {
        return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const { id: targetUserId, action } = context.params;
    
    if (adminUid === targetUserId) {
        return NextResponse.json({ error: 'Admin cannot perform actions on themselves.' }, { status: 400 });
    }

    const db = getAdminDb();
    const auth = getAdminAuth();

    try {
        const userRef = db.collection('users').doc(targetUserId);
        let message = '';
        let payload: any = {};

        if (request.body && action === 'set-role') {
          try {
            payload = await request.json();
          } catch (e) {
            // Ignore if body is not JSON or empty
          }
        }
        
        switch (action) {
            case 'set-role':
                const { role } = payload;
                if (!role || !['user', 'moderator', 'admin'].includes(role)) {
                    return NextResponse.json({ error: 'Invalid role specified.' }, { status: 400 });
                }
                await userRef.update({ role });
                message = `User role updated to ${role}.`;
                break;

            case 'ban':
                await userRef.update({ status: 'banned' });
                await auth.updateUser(targetUserId, { disabled: true });
                message = 'User has been banned.';
                break;

            case 'unban':
                await userRef.update({ status: 'active' });
                await auth.updateUser(targetUserId, { disabled: false });
                message = 'User has been unbanned.';
                break;

            default:
                return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
        }
        
        await db.collection('moderationActions').add({
            adminId: adminUid,
            action: action,
            targetUserId: targetUserId,
            payload: payload || null,
            createdAt: Timestamp.now(),
        });
        
        revalidatePath('/admin/users');
        
        return NextResponse.json({ success: true, message });

    } catch (error: any) {
        console.error(`Admin action '${action}' on user '${targetUserId}' failed:`, error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}

    