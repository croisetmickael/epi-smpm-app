import React, { useState, useEffect } from 'react';
import './AlertButton.css';

const AlertButton = ({ agents }) => {
  const [alerts, setAlerts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const CURRENT_YEAR = new Date().getFullYear();

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
    if (!agents || agents.length === 0) return;

    const found = [];

    agents.forEach((agent) => {
      const nom = agent.nom || '';
      const prenom = agent.prenom || '';
      const agentName = nom + ' ' + prenom;

      const check = (epiType, epiData) => {
        if (!epiData) return;
        const dateVal = epiData.date || epiData.Date || '';
        if (!dateVal) return;
        const year = parseInt(String(dateVal).trim(), 10);
        if (isNaN(year)) return;
        const severity = getSeverity(year);
        if (severity === 'ok') return;
        found.push({
          agent: agentName,
          epiType: epiType,
          marque: epiData.type || epiData.marque || 'N/A',
          numero: epiData.numero || epiData.Numero || 'N/A',
          year: year,
          severity: severity,
        });
      };

      check('BAUDRIER', agent.baudrier);
      check('CASQUE', agent.casque);
      check('LONGE', agent.longe);
      check('MOUSQUETON', agent.mousqueton);
      check('DESCENDEUR', agent.descendeur);
      check('POIGNEE', agent.poignee);
    });

    setAlerts(found);
  }, [agents]);

  const redCount = alerts.filter((a) => a.severity === 'expired').length;
  const orangeCount = alerts.filter((a) => a.severity === 'warning').length;

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          fontSize: '22px',
          cursor: 'pointer',
          padding: '8px',
        }}
      >
        {String.fromCodePoint(0x1F514)}
        {alerts.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#C00000',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {alerts.length}
          </span>
        )}
      </button>

      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '560px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
            }}
          >
            {/* HEADER */}
            <div style={{
              background: 'linear-gradient(135deg, #1F3864, #2E75B6)',
              color: 'white',
              padding: '18px 20px',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                ALERTES EXPIRATION ({alerts.length})
              </span>
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                {redCount > 0 && (
                  <span style={{ background: '#C00000', padding: '2px 10px', borderRadius: '12px' }}>
                    {redCount} EXPIRE
                  </span>
                )}
                {orangeCount > 0 && (
                  <span style={{ background: '#ED7D31', padding: '2px 10px', borderRadius: '12px' }}>
                    {orangeCount} ATTENTION
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
              >
                X
              </button>
            </div>

            {/* CONTENU */}
            <div style={{ overflowY: 'auto', padding: '16px', flex: 1 }}>
              {alerts.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#375623', padding: '30px' }}>
                  Tous les equipements sont a jour !
                </p>
              ) : (
                alerts.map((alert, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '12px',
                      padding: '14px',
                      borderLeft: '4px solid ' + (alert.severity === 'expired' ? '#C00000' : '#ED7D31'),
                      background: alert.severity === 'expired' ? '#fff0f0' : '#fff7f0',
                      borderRadius: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ color: '#1F3864' }}>{alert.agent}</strong>
                      <span style={{
                        background: alert.severity === 'expired' ? '#C00000' : '#ED7D31',
                        color: 'white',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}>
                        {getStatusText(alert.severity)}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#333', lineHeight: '1.6' }}>
                      <div><strong>EPI :</strong> {alert.epiType}</div>
                      <div><strong>MARQUE :</strong> {alert.marque}</div>
                      <div><strong>NUMERO :</strong> {alert.numero}</div>
                      <div><strong>EXPIRATION :</strong> {alert.year}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FOOTER */}
            <div style={{
              padding: '14px 20px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              background: '#f5f5f5',
              borderRadius: '0 0 12px 12px',
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '8px 20px',
                  background: '#e0e0e0',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertButton;
