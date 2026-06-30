import { Router, Request, Response } from 'express';
import { handleMissedCall } from '../services/missedCall';

const router = Router();

/**
 * POST /api/missed-calls/webhook
 * Twilio Webhook for missed calls.
 * Note: Twilio usually sends data as application/x-www-form-urlencoded.
 * Express should be configured to handle this.
 */
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    const { From, CallSid, FromCity, FromState, FromCountry } = req.body;

    if (!From || !CallSid) {
      console.warn('[MISSED CALL WEBHOOK] Received request with missing fields', req.body);
      res.status(400).send('Missing From or CallSid');
      return;
    }

    const result = await handleMissedCall({
      phone: From,
      callSid: CallSid,
      fromCity: FromCity,
      fromState: FromState,
      fromCountry: FromCountry,
    });

    // Twilio expects a TwiML response
    res.type('text/xml');
    res.send('<Response></Response>');
  } catch (error) {
    console.error('[MISSED CALL WEBHOOK] Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
