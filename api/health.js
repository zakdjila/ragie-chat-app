import { RAGIE_API_KEY, handleCors } from './_config.js';

export default function handler(req, res) {
  if (handleCors(req, res)) return;

  res.status(200).json({
    status: 'ok',
    ragieConfigured: !!RAGIE_API_KEY
  });
}
