import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  const { method } = req;
  const { Id, amount } = req.body;

  if (!Id) return res.status(400).json({ error: 'Missing Id' });

  if (method === 'GET') {
    // Get user credits
    const { data, error } = await supabase
      .from('users')
      .select('credits')
      .eq('Id', Id)
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ credits: data.credits });
  }

  if (method === 'POST') {
    // Add credits
    if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
    const { data, error } = await supabase
      .from('users')
      .update({ credits: supabase.raw('credits + ?', [amount]) })
      .eq('Id', Id)
      .select('credits')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ credits: data.credits });
  }

  if (method === 'PUT') {
    // Deduct credits
    if (typeof amount !== 'number' || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });
    const { data, error } = await supabase
      .from('users')
      .update({ credits: supabase.raw('credits - ?', [amount]) })
      .eq('Id', Id)
      .select('credits')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ credits: data.credits });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
