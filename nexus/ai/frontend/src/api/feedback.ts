export default async function handler(req: any, res: any) {
  if (req?.method && req.method !== 'POST') {
    if (res?.status) {
      return res.status(405).end();
    }
    return new Response(null, { status: 405 });
  }

  const { feedback, email, timestamp } = req?.body ?? {};
  console.log('Feedback:', { feedback, email, timestamp });

  if (res?.json) {
    return res.status(200).json({ ok: true });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
