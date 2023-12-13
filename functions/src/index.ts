import * as logger from 'firebase-functions/logger';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

export const helloWorld = onCall((request) => {
	if (!request.auth)
		throw new HttpsError('failed-precondition', 'The function must be called while authenticated.');
	logger.info('Hello logs!', { structuredData: true });
});
