import React, { useState, useEffect } from 'react';

export function AlertButton() {
  const [showModal, setShowModal] = useState(false);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      const response = await fetch('/api/sheets');
      if (!response.ok) throw new Error('Erreur API');
      
      const data = await response.json();
      const personnel = data.personnel || [];

      const alertsList = [];
      const YEAR = 2026;

      personnel.forEach(p => {
        if (p.baudrier_date) {
          const yr = parseInt(p.baudrier_date);
          if (yr < YEAR) {
            alertsList.push({
              level: 'red',
              agent: `${p.nom} ${p.prenom}`,
              mat: 'BAUDRIER',
              type: p.baudrier_type || '',
              an: yr
            });
          } else if (yr === YEAR) {
            alertsList.push({
              level: 'orange',
              agent: `${p.nom} ${p.prenom}`,
              mat: 'BAUDRIER',
              type: p.baudrier_type || '',
              an: yr
            });
          }
        }

        if (p.casque_date) {
          const yr = parseInt(p.casque_date);
          if (yr < YEAR) {
            alertsList.push({
              level: 'red',
              agent: `${p.nom} ${p.prenom}`,
              mat: 'CASQUE',
              type: p.casque_type || '',
              an: yr
            });
          } else if (yr === YEAR) {
            alertsList.push({
              level: 'orange',
              agent: `${p.nom} ${p.prenom}`,
              mat: 'CASQUE',
              type: p.casque_type || '',
              an: yr
            });
          }
        }

        if (p.longe_date) {
          const yr = parseInt(p.longe_date);
          if (yr < YEAR) {
            alertsList.push({
              level: 'red',
              agent: `${p.nom} ${p.prenom}`,
              mat: 'LONGE',
              type: p.longe_type || '',
              an: yr
            });
          } else if (yr === YEAR) {
            alertsList.push({
              level: 'orange',
              agent: `${p.nom} ${p.prenom}`,
              mat: 'LONGE',
              type: p.longe_type || '',
              an: yr
            });
          }
        }

        if (p.mousq_date) {
          const yr = parseInt(p.mousq_date);
          if (yr < YEAR) {
            alertsList.push({
              level: 'red',
              agent: `${p.nom} ${p.prenom}`,
              mat: 'MOUSQUETON',
              type: p.mousq_type || '',
              an: yr
            });
          } else if (yr === YEAR) {
            alertsList.push({
              level: 'orange',
              agent: `${p.nom} ${p.prenom}`,
              mat: 'MOUSQUETON',
              type: p.mousq_type || '',
              an: yr
            });
          }
        }

        if (p.desc_date) {
          const yr = parseInt(p.desc_date);
          if (yr < YEAR) {
            alertsList.push({
              level: 'red',
              agent: `${p.nom} ${p.prenom}`,
              mat: 'DESCENDEUR',
              type: p.desc_type || '',
              an: yr
            });
          } else if (yr === YEAR) {
            alertsList.push({
              level: 'orange',
              agent: `${p.nom} ${p.prenom}`,
              mat: 'DESCENDEUR',
              type: p.desc_type || '',
              an: yr
            });
          }
        }

        if (p.poig_date) {
          const yr = parseInt(p.poig_date);
          if (yr < YEAR) {
            alertsList.push({
              level: 'red',
              agent: `${p.nom} ${p.prenom}`,
              mat: 'POIGNÉE',
              type: p.poig_type || '',
              an: yr
            });
          } else if (yr === YEAR) {
            alertsList.push({
              level: 'orange',
              agent: `${p.nom} ${p.prenom}`,
              mat: 'POIGNÉE',
              type: p.poig_type || '',
              an: yr
            });
          }
        }
      });

      alertsList.sort((a, b) => {
        if (a.level === 'red' && b.level === 'orange') return -1;
        if (a.level === 'orange' && b.level === 'red') return 1;
        return a.agent.localeCompare(b.agent);
      });

      setAlerts(alertsList);
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    }
  }

  const redCount = alerts.filter(a => a.level === 'red').length;
  const orangeCount = alerts.filter(a => a.level === 'orange').length;
  const totalCount = alerts.length;

  return (
    <>
      <button
        className="alarm-button"
        onClick={() => setShowModal(true)}
        title={`${totalCount} alerte${totalCount > 1 ? 's' : ''}`}
      >
        🔔
        {totalCount > 0 && <span className="alarm-badge">{totalCount}</span>}
      </button>

      {showModal && (
        <AlertesModal
          alerts={alerts}
          redCount={redCount}
          orangeCount={orangeCount}
          totalCount={totalCount}
          onClose={() => setShowModal(false)}
          onRefresh={loadAlerts}
        />
      )}
    </>
  );
}

function AlertesModal({ alerts, redCount, orangeCount, totalCount, onClose, onRefresh }) {
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal alertes-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🚨 ALERTES D'EXPIRATION ({totalCount})</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {totalCount === 0 ? (
            <div className="no-alerts">
              <p>✅ Aucune alerte d'expiration!</p>
            </div>
          ) : (
            <>
              {redCount > 0 && (
                <section className="alerte-section">
                  <h4 className="alerte-title red">
                    🔴 EN RETARD ({redCount})
                  </h4>
                  {alerts
                    .filter(a => a.level === 'red')
                    .map((alert, i) => (
                      <div key={i} className="alerte-item red">
                        <div className="alerte-agent">{alert.agent}</div>
                        <div className="alerte-details">
                          {alert.mat} {alert.type && `(${alert.type})`} → {alert.an}
                        </div>
                      </div>
                    ))}
                </section>
              )}

              {orangeCount > 0 && (
                <section className="alerte-section">
                  <h4 className="alerte-title orange">
                    🟠 ANNÉE 2026 ({orangeCount})
                  </h4>
                  {alerts
                    .filter(a => a.level === 'orange')
                    .map((alert, i) => (
                      <div key={i} className="alerte-item orange">
                        <div className="alerte-agent">{alert.agent}</div>
                        <div className="alerte-details">
                          {alert.mat} {alert.type && `(${alert.type})`} → {alert.an}
                        </div>
                      </div>
                    ))}
                </section>
              )}
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-refresh" onClick={onRefresh}>
            🔄 Actualiser
          </button>
          <button className="btn-close" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
