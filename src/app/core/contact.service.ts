import { environment } from '../../environments/environment';
import type { Lang } from '../content';
import type { ContactValues } from '../engine/base';

const ENDPOINT = 'https://api.web3forms.com/submit';

/** Sends the contact form through Web3Forms. Resolves to true when the message was accepted. */
export async function sendContact(values: ContactValues, lang: Lang): Promise<boolean> {
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: environment.web3formsKey,
        subject: 'Skyward · ' + values.nome,
        from_name: 'Skyward website',
        name: values.nome,
        email: values.email,
        message: values.msg,
        language: lang,
        botcheck: '',
      }),
    });
    const data: { success?: boolean } = await res.json();
    return res.ok && data.success === true;
  } catch {
    return false;
  }
}
