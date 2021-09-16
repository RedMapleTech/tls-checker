const { exec } = require("child_process");
const { join } = require("path");
const openssl = join(__dirname, "./openssl/openssl");
const prompt = require("prompt-sync")({ sigint: true });

(async () => {
  try {
    const host = prompt("Enter server and port (i.e. redmaple.tech:443): ");
    const res = await getSupportedCipherSuites(host);
    console.log("The supported TLS protocols and ciphersuites: ", res);
  } catch (error) {
    console.log(error);
  }
})();

async function getSupportedCipherSuites(host) {
  const tlsMap = {
    ssl3: "cipher",
    tls1: "cipher",
    tls1_1: "cipher",
    tls1_2: "cipher",
    tls1_3: "ciphersuites",
  };
  const summary = { protocols: [], ciphers: [] };
  for (const [prot, swi] of Object.entries(tlsMap)) {
    const res = await Promise.all(
      (
        await getCiphers(prot)
      ).map((cipher) => checkCipher(cipher, prot, swi, host))
    ).then((res) => res.filter((r) => r.pass).map((r) => r.cipher));
    if (res.length > 0) {
      summary.protocols.push(prot);
      summary.ciphers.push(...res);
    }
  }
  return summary;
}

function getCiphers(protocol) {
  return new Promise((resolve, reject) => {
    exec(
      `${openssl} ciphers -${protocol} -s 'ALL:eNULL'`,
      (error, stdout, stderr) => {
        if (error) {
          reject(error.message);
        }
        if (stderr) {
          reject(stderr);
        }
        resolve(stdout);
      }
    );
  }).then((res) => res.trim().split(":"));
}

function checkCipher(cipher, prot, swi, host) {
  return new Promise((resolve) => {
    exec(
      `${openssl} s_client -${prot} -${swi} '${cipher}' ${host} </dev/null 2>&1`,
      (error, stdout, stderr) => {
        if (error) {
          resolve(error.message);
          return;
        }
        if (stderr) {
          resolve(stderr);
          return;
        }
        resolve(stdout);
      }
    );
  }).then((res) => {
    return { cipher: cipher, pass: !res.includes("Command failed:") };
  });
}
