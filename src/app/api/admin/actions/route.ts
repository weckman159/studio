
import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { Timestamp } from 'firebase-admin/firestore';
import { UserRoles } from '@/lib/types';

/**
 * Securely verifies if the request comes from an authenticated user with an 'admin' role.
 * It uses the Firebase ID token from the Authorization header.
 */
async function getAdminUserFromRequest(request: NextRequest): Promise<{ uid: string; roles: UserRoles } | null> {
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
        
        const userRoles = userDoc.data()?.roles as UserRoles;
        if (!userRoles || (!userRoles.isAdmin && !userRoles.isModerator)) {
            console.warn(`Admin action attempted by user ${uid} who is not an admin or moderator.`);
            return null;
        }

        return { uid: uid, roles: userRoles };
    } catch (error) {
        console.error("Auth token verification failed:", error);
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
        let updateData: { [key: string]: any } = {};
        let message = '';

        switch (action) {
            case 'setRole':
                const newRole = payload?.role;
                if (!newRole || !['user', 'moderator', 'admin'].includes(newRole)) {
                    return NextResponse.json({ error: 'Invalid role provided' }, { status: 400 });
                }

                const targetUserDoc = await userRef.get();
                if (!targetUserDoc.exists) {
                    return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
                }
                const currentRoles = (targetUserDoc.data()?.roles || {}) as UserRoles;
                
                const newRoles: UserRoles = {
                    ...currentRoles,
                    isAdmin: newRole === 'admin',
                    isModerator: newRole === 'moderator' || newRole === 'admin',
                };
                
                updateData = { roles: newRoles };
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
