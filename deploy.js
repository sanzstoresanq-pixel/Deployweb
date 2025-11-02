// api/deploy.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Gunakan POST" });
  }

  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    return res.status(400).json({ error: "Token Vercel belum diset di Environment Variable" });
  }

  const form = await req.formData();
  const name = form.get("name")?.toLowerCase().replace(/[^a-z0-9-]/g, "-") || "sanz-app";
  const file = form.get("file");
  if (!file) return res.status(400).json({ error: "Tidak ada file HTML diunggah" });

  const html = await file.text();

  const deploy = await fetch("https://api.vercel.com/v13/deployments", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      files: [{ file: "index.html", data: html }],
      projectSettings: { framework: null },
    }),
  });

  const data = await deploy.json();
  if (data.error) return res.status(500).json({ error: data.error.message });

  res.status(200).json({ url: `https://${data.url}` });
}
