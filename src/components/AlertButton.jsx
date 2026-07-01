import React, { useState, useEffect } from 'react';
import './AlertButton.css';

function AlertButton({ agents }) {
  const [alerts, setAlerts] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!agents || agents.length === 0) {
      setAlerts([]);
      return;
    }

    const currentYear = new Date().getFullYear();
    const found = [];

    agents.forEach((agent) => {
      const nom = agent.nom || '';
      const prenom = agent.prenom || '';
      const agentName = nom + ' ' + prenom;

      const processEPI = (epiType, epiTypeField, epiDateField, epiNumField) => {
        const typeVal = agent[epiTypeField];
        const dateVal = agent[epiDateField];
        const numVal = agent[epiNumField];

        if (!typeVal || !dateVal) return;

        const year = parseInt(String(dateVal).trim(), 10);
        if (isNaN(year)) return;

        let severity = 'ok';
        if (year < currentYear) severity = 'expired';
        else if (year === currentYear) severity = 'warning';

        if (severity === 'ok') return;

        found.push({
          agent: agentName,
          epiType: epiType,
          marque: typeVal,
          numero: numVal || 'N/A',
          year: year,
          severity: severity,
        });
      };

      processEPI('BAUDRIER', 'baudrier_type', 'baudrier_date', 'baudrier_num');
      processEPI('CASQUE', 'casque_type', 'casque_date', 'casque_num');
      processEPI('LONGE', 'longe_type', 'longe_date', 'longe_num');
      processEPI('MOUSQUETON', 'mousq_type', 'mousq_date', 'mousq_num1');
      processEPI('DESCENDEUR', 'desc_type', 'desc_date', 'desc_num');
      processEPI('POIGNEE', 'poig_type', 'poig_date', 'poig_num');
    });

    setAlerts(found);
  }, [agents]);

  const expiredAlerts = alerts.filter(a => a.severity === 'expired');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');

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

            <div style={{ overflowY: 'auto', padding: '16px', flex: 1 }}>
              {alerts.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#375623', padding: '30px' }}>
                  Tous les equipements sont a jour!
                </p>
              ) : (
                <>
                  {expiredAlerts.length > 0 && (
                    <>
                      <div style={{ fontWeight: 'bold', color: '#C00000', marginBottom: '14px', fontSize: '15px', paddingBottom: '8px', borderBottom: '2px solid #C00000' }}>
                        EXPIRE ({expiredAlerts.length})
                      </div>
                      {expiredAlerts.map((alert, index) => (
                        <div
                          key={'expired-' + index}
                          style={{
                            marginBottom: '12px',
                            padding: '14px',
                            borderLeft: '4px solid #C00000',
                            background: '#fff0f0',
                            borderRadius: '6px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ color: '#1F3864' }}>{alert.agent}</strong>
                            <span style={{
                              background: '#C00000',
                              color: 'white',
                              padding: '2px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                            }}>
                              EXPIRE
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#333', lineHeight: '1.6' }}>
                            <div><strong>EPI :</strong> {alert.epiType}</div>
                            <div><strong>MARQUE :</strong> {alert.marque}</div>
                            <div><strong>NUMERO :</strong> {alert.numero}</div>
                            <div><strong>EXPIRATION :</strong> {alert.year}</div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {warningAlerts.length > 0 && (
                    <>
                      <div style={{ fontWeight: 'bold', color: '#ED7D31', marginBottom: '14px', fontSize: '15px', paddingBottom: '8px', borderBottom: '2px solid #ED7D31', marginTop: expiredAlerts.length > 0 ? '20px' : '0px' }}>
                        ATTENTION ({warningAlerts.length})
                      </div>
                      {warningAlerts.map((alert, index) => (
                        <div
                          key={'warning-' + index}
                          style={{
                            marginBottom: '12px',
                            padding: '14px',
                            borderLeft: '4px solid #ED7D31',
                            background: '#fff7f0',
                            borderRadius: '6px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ color: '#1F3864' }}>{alert.agent}</strong>
                            <span style={{
                              background: '#ED7D31',
                              color: 'white',
                              padding: '2px 10px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                            }}>
                              ATTENTION
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#333', lineHeight: '1.6' }}>
                            <div><strong>EPI :</strong> {alert.epiType}</div>
                            <div><strong>MARQUE :</strong> {alert.marque}</div>
                            <div><strong>NUMERO :</strong> {alert.numero}</div>
                            <div><strong>EXPIRATION :</strong> {alert.year}</div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>

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
}

export default AlertButton;
