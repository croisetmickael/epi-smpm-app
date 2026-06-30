const { google } = require('googleapis');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

let sheetsAPI = null;

function getAuth() {
  if (!SERVICE_ACCOUNT_KEY) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY manquante');
  }
  
  const credentials = JSON.parse(SERVICE_ACCOUNT_KEY);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheetsAPI() {
  if (!sheetsAPI) {
    const auth = getAuth();
    sheetsAPI = google.sheets({ version: 'v4', auth });
  }
  return sheetsAPI;
}

async function readSheet(sheetName) {
  const sheets = getSheetsAPI();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${sheetName}!A:R`,
  });

  const rows = response.data.values || [];
  if (rows.length < 2) return [];

  const headers = rows[0] || [];
  const data = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      const key = (header || '').toLowerCase().trim().replace(/\s+/g, '_');
      obj[key] = row[i] || '';
    });
    return obj;
  });

  return data;
}

async function updatePersonnel(rowIndex, data) {
  const sheets = getSheetsAPI();
  
  const values = [[
    data.nom || '',
    data.prenom || '',
    data.baudrier_type || '',
    data.baudrier_num || '',
    data.baudrier_date || '',
    data.casque_type || '',
    data.casque_num || '',
    data.casque_date || '',
    data.longe_type || '',
    data.longe_num || '',
    data.longe_date || '',
    data.mousq_type || '',
    data.mousq_num1 || '',
    data.mousq_num2 || '',
    data.desc_type || '',
    data.desc_num || '',
    data.desc_date || '',
    data.poig_type || '',
    data.poig_num || '',
    data.poig_date || '',
  ]];

  const startRow = rowIndex + 2;
  const range = `EPI PERSONNELS SMPM!A${startRow}:T${startRow}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range,
    valueInputOption: 'RAW',
    resource: { values },
  });

  return { success: true };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const personnel = await readSheet('EPI PERSONNELS SMPM');
      
      return res.status(200).json({
        personnel: personnel || [],
      });
    }

    if (req.method === 'POST') {
      const { action, rowIndex, data } = req.body;

      if (action === 'updatePersonnel' && rowIndex !== undefined && data) {
        await updatePersonnel(rowIndex, data);
        return res.status(200).json({ success: true });
      }

      return res.status(400).json({ error: 'Action non reconnue' });
    }

    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (error) {
    console.error('Erreur:', error.message);
    return res.status(500).json({
      error: error.message || 'Erreur serveur',
    });
  }
}
