export default function handler(req, res) {
  return res.status(200).json({ ok: true, route: 'ping', runtime: 'vercel-node', time: new Date().toISOString() });
}
