
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * WARNING: This is a temporary way to get the admin user for the MVP.
 * In a real-world production application, you MUST verify a JWT sent from the client
 * via the Authorization header (e.g., `await auth().verifyIdToken(token)`).
 * Relying on a simple header like 'x-user-id' is insecure and can be easily spoofed.
 */
async function getAdminUserFromRequest(request: NextRequest): Promise<{ uid: string; role: string } | null> {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
        console.warn("API request missing 'x-user-id' header.");
        return null;
    }

    try {
        const db = getAdminDb();
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            console.warn(`Admin action attempted by non-existent user: ${userId}`);
            return null;
        }

        const userData = userDoc.data();
        if (userData.role !== 'admin') {
            console.warn(`Admin action attempted by non-admin user: ${userId}`);
            return null;
        }

        return { uid: userId, role: userData.role };
    } catch (error) {
        console.error("Error verifying admin user:", error);
        return null;
    }
}

export async function POST(request: NextRequest) {
    const adminUser = await getAdminUserFromRequest(request);

    if (!adminUser) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, targetUserId, payload } = body;
    
    if (!action || !targetUserId) {
        return NextResponse.json({ error: 'Missing action or targetUserId' }, { status: 400 });
    }

    const db = getAdminDb();
    const auth = getAdminAuth();
    const userRef = db.collection('users').doc(targetUserId);

    try {
        let updateData = {};
        let message = '';

        switch (action) {
            case 'setRole':
                const newRole = payload?.role;
                if (!newRole || !['user', 'moderator', 'admin'].includes(newRole)) {
                    return NextResponse.json({ error: 'Invalid role provided' }, { status: 400 });
                }
                updateData = { role: newRole };
                message = `Роль пользователя обновлена на ${newRole}`;
                break;

            case 'ban':
                updateData = { status: 'banned' };
                await auth.updateUser(targetUserId, { disabled: true });
                message = 'Пользователь забанен';
                break;

            case 'unban':
                updateData = { status: 'active' };
                await auth.updateUser(targetUserId, { disabled: false });
                message = 'Пользователь разбанен';
                break;
            
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        await userRef.update(updateData);

        // Audit Log
        await db.collection('moderationActions').add({
            adminId: adminUser.uid,
            action: action,
            targetUserId: targetUserId,
            payload: payload || null,
            createdAt: Timestamp.now(),
        });
        
        // Revalidate user profile page to reflect changes
        revalidatePath(`/profile/${targetUserId}`);
        revalidatePath(`/admin/users`);

        return NextResponse.json({ success: true, message: message });

    } catch (error: any) {
        console.error(`Admin action "${action}" on user ${targetUserId} failed:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
