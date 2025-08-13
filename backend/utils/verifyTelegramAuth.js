const crypto = require("crypto");

function parseInitData(initData) {
  return Object.fromEntries(new URLSearchParams(initData));
}

function verifyTelegramAuth(initData) {
  const data = parseInitData(initData);
  const hash = data.hash;
  delete data.hash;

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(process.env.BOT_TOKEN)
    .digest();

  const checkString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("\n");

  const _hash = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  return _hash === hash;
}

module.exports = { verifyTelegramAuth };
