
import { randomBytes, sign, verify } from 'crypto';
import db from './db';
import { Verifier } from "bip322-js";

export class Authenticator {
  private GenerateNonce(): string {
    const nonce = randomBytes(32).toString('hex');
    return nonce;
  }
  public async GenerateSignInMessage(ordinalsAddress: string, walletType: string|null, headers: Headers): Promise<string> {
    const nonce = this.GenerateNonce();
    const message = `Sign this message to log in to Vermilion with the address: ${ordinalsAddress}\n\nSigning is a safe way to prove you own this address.\n\nNonce: ${nonce}`;
    await db.appendSignInRecord({
      sign_in_status: 'pending',
      address: ordinalsAddress,
      sign_in_message: message,
      wallet_type: walletType,
      sec_ch_ua: headers.get('sec-ch-ua') || null,
      sec_ch_ua_mobile: headers.get('sec-ch-ua-mobile') || null,
      sec_ch_ua_platform: headers.get('sec-ch-ua-platform') || null,
      user_agent: headers.get('user-agent') || null,
      accept_language: headers.get('accept-language') || null
    })
    return message;
  }
  public async VerifySignature(ordinalsAddress: string, message: string, signature: string, signatureType: string|null): Promise<any> {
    const signInRecord = await db.getSignInRecord(ordinalsAddress, message);
    let verifyError = null;
    let isValid = false;
    if (!signInRecord) {
      verifyError = 'Sign in record not found';
    }
    if (signInRecord.sign_in_status === 'signed_in') {
      verifyError = 'Already signed in';
    }
    if (signInRecord.sign_in_status === 'failed') {
      verifyError = 'Signature verification already failed, please try again';
    }
    if (signatureType && signatureType !== 'bip322') {
      verifyError = 'Invalid signature type';
    }
    try {
      isValid = Verifier.verifySignature(
        ordinalsAddress,
        message,
        signature
      );
    } catch (error: any) {
      isValid = false;
      verifyError = error.message;
    }
    if (isValid) {
      await db.updateSignInRecord(ordinalsAddress, message, {
        sign_in_status: 'signed_in',
        signature: signature,
        verified: true,
        verified_timestamp: new Date(),
      });
    } else {
      await db.updateSignInRecord(ordinalsAddress, message, {
        sign_in_status: 'failed',
        signature: signature,
        verified: false,
        verified_timestamp: new Date(),
        verify_error: verifyError,
      });
    }
    let response = {
      isValid,
      verifyError,
    };
    return response;
  }
}