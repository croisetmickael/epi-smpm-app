import React, { useState, useEffect } from 'react';
import './AlertButton.css';

const AlertButton = ({ agents }) => {
  const [alerts, setAlerts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const CURRENT_YEAR = 2026;

  const getSeverity = (year) => {
    if (year < CURRENT_YEAR) return 'expired';
    if (year === CURRENT_YEAR) return 'warning';
    return 'ok';
  };

  const getStatusText = (severity) => {
    if (severity === 'expired') return 'EXPIRE';
    if (severity === 'warning') return 'ATTENTION';
    return 'OK';
  };

  useEffect(() => {
    const expiredEPI = [];
    agents.forEach((agent) => {
      const { nom, prenom, baudrier, casque, longe, mousqueton, descendeur, poignee } = agent;

      const checkEPI = (epiType, epiData) => {
        if (epiData && epiData.date) {
          const year = parseInt(epiData.date, 10);
          if (year <= CURRENT_YEAR) {
            expiredEPI.push({
              agent: nom + ' ' + prenom,
              epiType: epiType,
              marque: epiData.type || 'N/A',
              numero: epiData.numero || 'N/A',
              year: year,
              severity: getSeverity(year),
            });
          }
        }
      };

      checkEPI('BAUDRIER', baudrier);
      checkEPI('CASQUE', casque);
      checkEPI('LONGE', longe);
      checkEPI('MOUSQUETON', mousqueton);
      checkEPI('DESCENDEUR', descendeur);
      checkEPI('POIGNEE', poignee);
    });

    const filteredAlerts = expiredEPI.filter(alert => alert.severity !== 'ok');
    setAlerts(filteredAlerts);
  }, [agents]);

  return (
    <>
      <button
        className={'alert-button' + (alerts.length > 0 ? ' has-alerts' : '')}
        onClick={() => setShowModal(true)}
      >
        {alerts.length > 0 ? '[' + alerts.length + ']' : '[0]'}
      </button>

      {showModal && (
        <div className="alert-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
            <div className="alert-modal-header">
              <h2>ALERTES EXPIRATION ({alerts.length})</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>X</button>
            </div>

            <div className="alert-modal-content">
              {alerts.length === 0 ? (
                <p className="no-alerts">OK - Tous les equipements sont a jour</p>
              ) : (
                alerts.map((alert, index) => (
                  <div key={index} className={'alert-item alert-' + alert.severity}>
                    <div className="alert-header">
                      <span className="agent-name">{alert.agent}</span>
                      <span className={'status-badge status-' + alert.severity}>
                        {getStatusText(alert.severity)}
                      </span>
                    </div>
                    <div className="alert-details">
                      <p><strong>EPI:</strong> {alert.epiType}</p>
                      <p><strong>MARQUE:</strong> {alert.marque}</p>
                      <p><strong>NUMERO:</strong> {alert.numero}</p>
                      <p><strong>EXPIRATION:</strong> {alert.year}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="alert-modal-footer">
              <button className="btn-primary" onClick={() => setShowModal(false)}>
                Actualiser
              </button>
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AlertButton;
