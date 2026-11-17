import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Util = require('@root/acme/utils.js');
const Enc = require('@root/encoding/base64');

const jeda = (ms) => new Promise((r) => setTimeout(r, ms));

// ACME.js 3.x mengirim ulang POST ke /finalize sampai status valid.
// Let's Encrypt menjawab 403 orderNotReady begitu order masuk "processing".
// Tambal ini: finalize sekali, lalu POST-as-GET ke URL order sampai valid.
export function pasangTambalACME(ACME) {
  if (ACME._tambalRsumb) return;
  ACME._tambalRsumb = true;

  ACME._pollOrderStatus = async function pollOrderStatus(me, options, kid, order, verifieds) {
    const payload = JSON.stringify({ csr: ACME._csrToUrlBase64(options.csr.trimEnd()) });
    const kirim = (url, body) => Util._jwsRequest(me, {
      accountKey: options.accountKey,
      url,
      protected: { kid },
      payload: body
    });

    const awal = await kirim(order._finalizeUrl, Enc.strToBuf(payload));
    let orderBody = awal.body;

    for (let i = 0; i < 30; i++) {
      if (orderBody?.status === 'valid' && orderBody.certificate) {
        orderBody._certificateUrl = orderBody.certificate;
        return orderBody;
      }
      if (orderBody?.status === 'invalid') {
        throw new Error(`Order invalid: ${JSON.stringify(orderBody.error || orderBody)}`);
      }
      if (orderBody?.status !== 'processing' && orderBody?.status !== 'ready' && orderBody?.status !== 'pending') {
        throw new Error(`Status order tidak dikenal: ${orderBody?.status}`);
      }
      await jeda(2000);
      orderBody = (await kirim(order._orderUrl, Enc.binToBuf(''))).body;
    }
    throw new Error(`Order belum valid setelah 60 detik. Domain: ${(verifieds || options.domains).join(', ')}`);
  };
}
