
import { randomBytes } from 'crypto';
import db from './db';
import { Verifier } from "bip322-js";
import jwt from 'jsonwebtoken';
import { parse } from 'yaml';

const configFile = Bun.file(`${process.env.HOME}/ord.yaml`);
const config = parse(await configFile.text());

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
    let authToken = null;
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
      authToken = this.GenerateAccessToken(ordinalsAddress);
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
      authToken,
      verifyError,
    };
    return response;
  }
  public GenerateAccessToken(ordinalsAddress: string): string {
    const secret = config.access_token_secret;
    const token = jwt.sign(
      { address: ordinalsAddress },
      secret,
      { expiresIn: '1d' }
    );
    return token;
  }
  public VerifyAccessToken(token: string, address: string): {isValid: boolean, error?: string} {
    const secret = config.access_token_secret;
    try {
      const decoded = jwt.verify(token, secret) as { address: string };
      return decoded.address === address
        ? { isValid: true }
        : { isValid: false, error: 'Addresses do not match' };
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return {
          isValid: false,
          error: 'Your session has expired. Please sign in again.'
        };
      } else if (['invalid signature', 'jwt malformed'].includes(err.message)) {
        return {
          isValid: false,
          error: 'Your authentication token is invalid. Please sign in again.'
        };
      } else {
        console.error('Error verifying access token:', err);
        return {
          isValid: false,
          error: err.name
        };
      }
    }
  }
  public GetAuthorizedAddressFromToken(token: string): {isValid: boolean, address?: string, error?: string} {
    const secret = config.access_token_secret;
    try {
      const decoded = jwt.verify(token, secret) as { address: string };
      return {
        isValid: true,
        address: decoded.address
      };
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return {
          isValid: false,
          error: 'Your session has expired. Please sign in again.'
        };
      } else if (['invalid signature', 'jwt malformed'].includes(err.message)) {
        return {
          isValid: false,
          error: 'Your authentication token is invalid. Please sign in again.'
        };
      } else {
        console.error('Error verifying access token:', err);
        return {
          isValid: false,
          error: err.name
        };
      }
    }
  }
}
