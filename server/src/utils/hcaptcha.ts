import https from 'https';

interface HCaptchaVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

/**
 * Verify hCaptcha token with hCaptcha API
 */
export async function verifyHCaptcha(token: string, remoteip?: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET;
  
  if (!secret) {
    console.warn('HCAPTCHA_SECRET not configured, skipping verification in development');
    return process.env.NODE_ENV === 'development'; // Skip in dev, fail in prod
  }

  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      secret,
      response: token,
      ...(remoteip && { remoteip })
    }).toString();

    const options = {
      hostname: 'hcaptcha.com',
      port: 443,
      path: '/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response: HCaptchaVerifyResponse = JSON.parse(data);
          
          if (response.success) {
            resolve(true);
          } else {
            console.error('hCaptcha verification failed:', response['error-codes']);
            resolve(false);
          }
        } catch (error) {
          console.error('Failed to parse hCaptcha response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('hCaptcha verification request failed:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}
