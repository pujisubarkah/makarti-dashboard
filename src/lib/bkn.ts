let cachedToken: string | null = null;
let expiredAt = 0;

export async function getBknToken() {
  if (cachedToken && Date.now() < expiredAt) {
    return cachedToken;
  }

  const res = await fetch("https://apimws.bkn.go.id/oauth2/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.BKN_CLIENT_ID + ":" + process.env.BKN_CLIENT_SECRET
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const json = await res.json();

  cachedToken = json.access_token;
  expiredAt = Date.now() + (json.expires_in - 60) * 1000;

  return cachedToken;
}
