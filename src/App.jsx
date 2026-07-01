import React, { useState, useEffect } from 'react';
import './App.css';
import AlertButton from './components/AlertButton';  // 

function App() {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('agents');
  
  // Tab 1: Recherche Agents
  const [searchAgent, setSearchAgent] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [editingAgent, setEditingAgent] = useState(null);
  const [editData, setEditData] = useState({});

  // Tab 2: Recherche Inversée
  const [searchNumber, setSearchNumber] = useState('');
  const [inverseResults, setInverseResults] = useState([]);

  useEffect(() => {
    loadPersonnel();
  }, []);

  async function loadPersonnel() {
    setLoading(true);
    try {
      const response = await fetch('/api/sheets');
      if (!response.ok) throw new Error('Erreur API');
      const data = await response.json();
      setPersonnel(data.personnel || []);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  }

  // ===== TAB 2: RECHERCHE INVERSÉE =====
  useEffect(() => {
    if (!searchNumber.trim()) {
      setInverseResults([]);
      return;
    }

    const query = searchNumber.toLowerCase().trim();
    const results = [];

    personnel.forEach(p => {
      const epiFields = [
        { field: 'baudrier_num', label: 'BAUDRIER', type: p.baudrier_type, date: p.baudrier_date },
        { field: 'casque_num', label: 'CASQUE', type: p.casque_type, date: p.casque_date },
        { field: 'longe_num', label: 'LONGE', type: p.longe_type, date: p.longe_date },
        { field: 'mousq_num1', label: 'MOUSQUETON', type: p.mousq_type, date: p.mousq_date },
        { field: 'mousq_num2', label: 'MOUSQUETON', type: p.mousq_type, date: p.mousq_date },
        { field: 'desc_num', label: 'DESCENDEUR', type: p.desc_type, date: p.desc_date },
        { field: 'poig_num', label: 'POIGNÉE', type: p.poig_type, date: p.poig_date },
      ];

      epiFields.forEach(epi => {
        const value = p[epi.field];
        if (value && value.toLowerCase().includes(query)) {
          results.push({
            agent: `${p.nom} ${p.prenom}`,
            epi: epi.label,
            type: epi.type || 'N/A',
            number: value,
            date: epi.date,
            isExpired: epi.date && parseInt(epi.date) < 2026,
            isWarning: epi.date && parseInt(epi.date) === 2026,
          });
        }
      });
    });

    setInverseResults(results);
  }, [searchNumber, personnel]);

  // ===== TAB 1: RECHERCHE AGENTS =====
  const filteredAgents = personnel.filter(p =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(searchAgent.toLowerCase())
  );

  function openAgent(agent) {
    setSelectedAgent(agent);
    setEditingAgent(null);
  }

  function startEdit(agent) {
    setEditingAgent(agent);
    setEditData({ ...agent });
  }

  async function saveFiche() {
    try {
      const agentIndex = personnel.findIndex(p => p.nom === editData.nom && p.prenom === editData.prenom);
      if (agentIndex === -1) throw new Error('Agent not found');

      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updatePersonnel',
          rowIndex: agentIndex,
          data: editData,
        }),
      });

      if (!response.ok) throw new Error('Erreur sauvegarde');

      const newPersonnel = [...personnel];
      newPersonnel[agentIndex] = editData;
      setPersonnel(newPersonnel);
      
      setSelectedAgent(editData);
      setEditingAgent(null);
      alert('✅ Fiche mise à jour avec succès!');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    }
  }

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="header-left">
          <h1>📋 EPI SMPM</h1>
          <p>Gestion des Équipements de Protection Individuelle</p>
        </div>
        <div className="header-right">
          <AlertButton />
        </div>
      </header>

      {/* TABS */}
      <div className="tabs-wrapper">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'agents' ? 'active' : ''}`}
            onClick={() => setActiveTab('agents')}
          >
            👤 Recherche Agents
          </button>
          <button
            className={`tab ${activeTab === 'numbers' ? 'active' : ''}`}
            onClick={() => setActiveTab('numbers')}
          >
            🔢 Recherche Numéros
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="main-content">
        
        {/* ===== TAB 1: RECHERCHE AGENTS ===== */}
        {activeTab === 'agents' && (
          <>
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Rechercher par nom d'agent..."
                value={searchAgent}
                onChange={e => setSearchAgent(e.target.value)}
                className="search-input"
              />
              <button className="btn-refresh" onClick={loadPersonnel}>
                🔄 Actualiser
              </button>
            </div>

            {loading ? (
              <div className="loading">Chargement...</div>
            ) : filteredAgents.length === 0 ? (
              <div className="no-results">Aucun agent trouvé</div>
            ) : (
              <div className="agents-grid">
                {filteredAgents.map((p, i) => (
                  <button
                    key={i}
                    className="agent-button"
                    onClick={() => openAgent(p)}
                  >
                    <span className="agent-name">{p.prenom} {p.nom}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ===== TAB 2: RECHERCHE INVERSÉE ===== */}
        {activeTab === 'numbers' && (
          <>
            <div className="search-box">
              <input
                type="text"
                placeholder="🔢 Chercher par numéro de série (ex: 123, PRO-456)..."
                value={searchNumber}
                onChange={e => setSearchNumber(e.target.value)}
                className="search-input"
              />
              <button className="btn-refresh" onClick={loadPersonnel}>
                🔄 Actualiser
              </button>
            </div>

            {loading ? (
              <div className="loading">Chargement...</div>
            ) : inverseResults.length === 0 ? (
              <div className="no-results">
                {searchNumber.trim() === '' 
                  ? 'Tapez un numéro pour chercher...'
                  : 'Aucun numéro correspondant trouvé'}
              </div>
            ) : (
              <div className="inverse-results">
                <div className="results-header">
                  Résultats: <strong>{inverseResults.length}</strong> équipement(s) trouvé(s)
                </div>
                {inverseResults.map((result, i) => (
                  <div key={i} className="inverse-card">
                    <div className="inverse-card-header">
                      <span className="inverse-agent">👤 {result.agent}</span>
                      <span className={`inverse-status ${result.isExpired ? 'expired' : result.isWarning ? 'warning' : 'ok'}`}>
                        {result.isExpired ? '⚠️ EXPIRÉ' : result.isWarning ? '⚠️ 2026' : '✅ OK'}
                      </span>
                    </div>
                    <div className="inverse-card-body">
                      <div className="inverse-row">
                        <span className="inverse-label">EPI:</span>
                        <span className="inverse-value">{result.epi}</span>
                      </div>
                      <div className="inverse-row">
                        <span className="inverse-label">Type:</span>
                        <span className="inverse-value">{result.type}</span>
                      </div>
                      <div className="inverse-row">
                        <span className="inverse-label">Numéro:</span>
                        <span className="inverse-value inverse-number">{result.number}</span>
                      </div>
                      <div className="inverse-row">
                        <span className="inverse-label">Expiration:</span>
                        <span className="inverse-value">{result.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL: Fiche Détaillée */}
      {selectedAgent && (
        <div className="modal-bg open" onClick={() => setSelectedAgent(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {editingAgent ? (
              // MODE ÉDITION
              <>
                <div className="modal-header">
                  <h3>✏️ Éditer - {editData.prenom} {editData.nom}</h3>
                  <button className="close-btn" onClick={() => setEditingAgent(null)}>✕</button>
                </div>

                <div className="modal-body">
                  <div className="edit-form">
                    <div className="form-group">
                      <label>NOM</label>
                      <input type="text" value={editData.nom || ''} onChange={e => setEditData({...editData, nom: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>PRÉNOM</label>
                      <input type="text" value={editData.prenom || ''} onChange={e => setEditData({...editData, prenom: e.target.value})} />
                    </div>

                    <div className="form-group">
                      <label>🛡️ BAUDRIER</label>
                      <input type="text" placeholder="Type" value={editData.baudrier_type || ''} onChange={e => setEditData({...editData, baudrier_type: e.target.value})} />
                      <input type="text" placeholder="Numéro" value={editData.baudrier_num || ''} onChange={e => setEditData({...editData, baudrier_num: e.target.value})} />
                      <input type="text" placeholder="Date (ex: 2026)" value={editData.baudrier_date || ''} onChange={e => setEditData({...editData, baudrier_date: e.target.value})} />
                    </div>

                    <div className="form-group">
                      <label>🎩 CASQUE</label>
                      <input type="text" placeholder="Type" value={editData.casque_type || ''} onChange={e => setEditData({...editData, casque_type: e.target.value})} />
                      <input type="text" placeholder="Numéro" value={editData.casque_num || ''} onChange={e => setEditData({...editData, casque_num: e.target.value})} />
                      <input type="text" placeholder="Date (ex: 2026)" value={editData.casque_date || ''} onChange={e => setEditData({...editData, casque_date: e.target.value})} />
                    </div>

                    <div className="form-group">
                      <label>🪢 LONGE</label>
                      <input type="text" placeholder="Type" value={editData.longe_type || ''} onChange={e => setEditData({...editData, longe_type: e.target.value})} />
                      <input type="text" placeholder="Numéro" value={editData.longe_num || ''} onChange={e => setEditData({...editData, longe_num: e.target.value})} />
                      <input type="text" placeholder="Date (ex: 2026)" value={editData.longe_date || ''} onChange={e => setEditData({...editData, longe_date: e.target.value})} />
                    </div>

                    <div className="form-group">
                      <label>🔌 MOUSQUETON</label>
                      <input type="text" placeholder="Type" value={editData.mousq_type || ''} onChange={e => setEditData({...editData, mousq_type: e.target.value})} />
                      <input type="text" placeholder="Numéro 1" value={editData.mousq_num1 || ''} onChange={e => setEditData({...editData, mousq_num1: e.target.value})} />
                      <input type="text" placeholder="Numéro 2" value={editData.mousq_num2 || ''} onChange={e => setEditData({...editData, mousq_num2: e.target.value})} />
                    </div>

                    <div className="form-group">
                      <label>⬇️ DESCENDEUR</label>
                      <input type="text" placeholder="Type" value={editData.desc_type || ''} onChange={e => setEditData({...editData, desc_type: e.target.value})} />
                      <input type="text" placeholder="Numéro" value={editData.desc_num || ''} onChange={e => setEditData({...editData, desc_num: e.target.value})} />
                      <input type="text" placeholder="Date (ex: 2026)" value={editData.desc_date || ''} onChange={e => setEditData({...editData, desc_date: e.target.value})} />
                    </div>

                    <div className="form-group">
                      <label>✋ POIGNÉE</label>
                      <input type="text" placeholder="Type" value={editData.poig_type || ''} onChange={e => setEditData({...editData, poig_type: e.target.value})} />
                      <input type="text" placeholder="Numéro" value={editData.poig_num || ''} onChange={e => setEditData({...editData, poig_num: e.target.value})} />
                      <input type="text" placeholder="Date (ex: 2026)" value={editData.poig_date || ''} onChange={e => setEditData({...editData, poig_date: e.target.value})} />
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn-save" onClick={saveFiche}>💾 Sauvegarder</button>
                  <button className="btn-cancel" onClick={() => setEditingAgent(null)}>Annuler</button>
                </div>
              </>
            ) : (
              // MODE LECTURE
              <>
                <div className="modal-header">
                  <h3>{selectedAgent.prenom} {selectedAgent.nom}</h3>
                  <button className="close-btn" onClick={() => setSelectedAgent(null)}>✕</button>
                </div>

                <div className="modal-body">
                  <div className="epi-grid">
                    {selectedAgent.baudrier_type && (
                      <div className="epi-item">
                        <span className="epi-label">🛡️ BAUDRIER</span>
                        <span className="epi-value">{selectedAgent.baudrier_type}</span>
                        {selectedAgent.baudrier_num && <span className="epi-num">#{selectedAgent.baudrier_num}</span>}
                        <span className="epi-date">{selectedAgent.baudrier_date} {parseInt(selectedAgent.baudrier_date) < 2026 ? '⚠️' : '✅'}</span>
                      </div>
                    )}
                    {selectedAgent.casque_type && (
                      <div className="epi-item">
                        <span className="epi-label">🎩 CASQUE</span>
                        <span className="epi-value">{selectedAgent.casque_type}</span>
                        {selectedAgent.casque_num && <span className="epi-num">#{selectedAgent.casque_num}</span>}
                        <span className="epi-date">{selectedAgent.casque_date} {parseInt(selectedAgent.casque_date) < 2026 ? '⚠️' : '✅'}</span>
                      </div>
                    )}
                    {selectedAgent.longe_type && (
                      <div className="epi-item">
                        <span className="epi-label">🪢 LONGE</span>
                        <span className="epi-value">{selectedAgent.longe_type}</span>
                        {selectedAgent.longe_num && <span className="epi-num">#{selectedAgent.longe_num}</span>}
                        <span className="epi-date">{selectedAgent.longe_date} {parseInt(selectedAgent.longe_date) < 2026 ? '⚠️' : '✅'}</span>
                      </div>
                    )}
                    {selectedAgent.mousq_type && (
                      <div className="epi-item">
                        <span className="epi-label">🔌 MOUSQUETON</span>
                        <span className="epi-value">{selectedAgent.mousq_type}</span>
                        {selectedAgent.mousq_num1 && <span className="epi-num">#{selectedAgent.mousq_num1}</span>}
                        <span className="epi-date">✅ Présent</span>
                      </div>
                    )}
                    {selectedAgent.desc_type && (
                      <div className="epi-item">
                        <span className="epi-label">⬇️ DESCENDEUR</span>
                        <span className="epi-value">{selectedAgent.desc_type}</span>
                        {selectedAgent.desc_num && <span className="epi-num">#{selectedAgent.desc_num}</span>}
                        <span className="epi-date">{selectedAgent.desc_date} {parseInt(selectedAgent.desc_date) < 2026 ? '⚠️' : '✅'}</span>
                      </div>
                    )}
                    {selectedAgent.poig_type && (
                      <div className="epi-item">
                        <span className="epi-label">✋ POIGNÉE</span>
                        <span className="epi-value">{selectedAgent.poig_type}</span>
                        {selectedAgent.poig_num && <span className="epi-num">#{selectedAgent.poig_num}</span>}
                        <span className="epi-date">{selectedAgent.poig_date} {parseInt(selectedAgent.poig_date) < 2026 ? '⚠️' : '✅'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn-edit" onClick={() => startEdit(selectedAgent)}>✏️ Éditer</button>
                  <button className="btn-close" onClick={() => setSelectedAgent(null)}>Fermer</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
