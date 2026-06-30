import React, { useState, useEffect } from 'react';
import './AlertButton.css';

export function AlertButton() {
  const [expiredItems, setExpiredItems] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    loadExpiredItems();
  }, []);

  async function loadExpiredItems() {
    try {
      const response = await fetch('/api/sheets');
      if (!response.ok) throw new Error('Erreur API');
      const data = response.json();
      
      data.then(result => {
        const personnel = result.personnel || [];
        const expired = [];

        personnel.forEach(p => {
          const epiList = [
            { field: 'baudrier_num', label: 'BAUDRIER', type: p.baudrier_type, date: p.baudrier_date },
            { field: 'casque_num', label: 'CASQUE', type: p.casque_type, date: p.casque_date },
            { field: 'longe_num', label: 'LONGE', type: p.longe_type, date: p.longe_date },
            { field: 'mousq_num1', label: 'MOUSQUETON', type: p.mousq_type, date: p.mousq_date },
            { field: 'desc_num', label: 'DESCENDEUR', type: p.desc_type, date: p.desc_date },
            { field: 'poig_num', label: 'POIGNÉE', type: p.poig_type, date: p.poig_date },
          ];

          epiList.forEach(epi => {
            const year = epi.date ? parseInt(epi.date) : null;
            if (year && year < 2026) {
              expired.push({
                agent: `${p.nom} ${p.prenom}`,
                epi: epi.label,
                type: epi.type || 'N/A',
                number: p[epi.field] || 'N/A',
                date: epi.date,
                isExpired: year < 2026,
              });
            }
          });
        });

        setExpiredItems(expired);
      });
    } catch (error) {
      console.error('Erreur:', error);
    }
  }

  if (expiredItems.length === 0) return null;

  return (
    <>
      <button className="alarm-button" onClick={() => setShowAlert(true)}>
        🔔
        <span className="alarm-badge">{expiredItems.length}</span>
      </button>

      {showAlert && (
        <div className="alarm-modal-bg open" onClick={() => setShowAlert(false)}>
          <div className="alarm-modal" onClick={e => e.stopPropagation()}>
            <div className="alarm-modal-header">
              <h2>🔴 ALERTES D'EXPIRATION ({expiredItems.length})</h2>
              <button className="alarm-close" onClick={() => setShowAlert(false)}>✕</button>
            </div>

            <div className="alarm-modal-body">
              <div className="alarm-content">
                {expiredItems.map((item, i) => (
                  <div key={i} className="alarm-item">
                    <div className="alarm-item-header">
                      <span className="alarm-agent">👤 {item.agent}</span>
                      <span className="alarm-badge-status">
                        {item.isExpired ? '⚠️ EXPIRÉ' : ''}
                      </span>
                    </div>
                    <div className="alarm-item-details">
                      <div className="alarm-row">
                        <span className="alarm-label">EPI:</span>
                        <span className="alarm-value">{item.epi}</span>
                      </div>
                      <div className="alarm-row">
                        <span className="alarm-label">MARQUE:</span>
                        <span className="alarm-value">{item.type}</span>
                      </div>
                      <div className="alarm-row">
                        <span className="alarm-label">NUMÉRO:</span>
                        <span className="alarm-value">{item.number}</span>
                      </div>
                      <div className="alarm-row">
                        <span className="alarm-label">EXPIRATION:</span>
                        <span className="alarm-value alarm-expired">{item.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="alarm-modal-footer">
              <button className="alarm-btn-refresh" onClick={() => {
                loadExpiredItems();
                setShowAlert(false);
              }}>
                🔄 Actualiser
              </button>
              <button className="alarm-btn-close" onClick={() => setShowAlert(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
