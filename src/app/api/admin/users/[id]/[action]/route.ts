
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

/**
 * Verifies if the request is from an authenticated admin user.
 * This is a simplified auth check for the MVP. In a real-world scenario,
 * you would verify a JWT passed in the Authorization header.
 * @param request - The incoming NextRequest.
 * @returns The admin user's UID if authorized, otherwise null.
 */
async function verifyAdmin(request: NextRequest): Promise<string | null> {
    const adminUid = request.headers.get('x-admin-uid');
    if (!adminUid) {
        return null;
    }

    try {
        const db = getAdminDb();
        const adminUserDoc = await db.collection('users').doc(adminUid).get();

        if (!adminUserDoc.exists || adminUserDoc.data()?.role !== 'admin') {
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
    { params }: { params: { id: string; action: string } }
) {
    const adminUid = await verifyAdmin(request);
    if (!adminUid) {
        return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
    }

    const { id: targetUserId, action } = params;
    
    if (adminUid === targetUserId) {
        return NextResponse.json({ error: 'Admin cannot perform actions on themselves.' }, { status: 400 });
    }

    const db = getAdminDb();
    const auth = getAdminAuth();

    try {
        const userRef = db.collection('users').doc(targetUserId);
        const body = await request.json().catch(() => ({})); // Handle empty body for actions like 'ban'

        switch (action) {
            case 'setRole':
                const { role } = body;
                if (!role || !['user', 'moderator', 'admin'].includes(role)) {
                    return NextResponse.json({ error: 'Invalid role specified.' }, { status: 400 });
                }
                await userRef.update({ role });
                revalidatePath(`/profile/${targetUserId}`);
                return NextResponse.json({ success: true, message: `User role updated to ${role}.` });

            case 'ban':
                await userRef.update({ status: 'banned' });
                await auth.updateUser(targetUserId, { disabled: true });
                return NextResponse.json({ success: true, message: 'User has been banned.' });

            case 'unban':
                await userRef.update({ status: 'active' });
                await auth.updateUser(targetUserId, { disabled: false });
                return NextResponse.json({ success: true, message: 'User has been unbanned.' });

            default:
                return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
        }
    } catch (error: any) {
        console.error(`Admin action '${action}' on user '${targetUserId}' failed:`, error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
