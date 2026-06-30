import React, { useState, useEffect } from 'react';
import './App.css';
import { AlertButton } from './components/AlertButton';

function App() {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('agents');
  
  // Tab 1: Recherche Agents
  const [searchAgent, setSearchAgent] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
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

  // ===== TAB 1: RECHERCHE AGENTS =====
  const filteredAgents = personnel.filter(p =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(searchAgent.toLowerCase())
  );

  function startEdit(index, agent) {
    setEditingIndex(index);
    setEditData({ ...agent });
  }

  async function saveFiche() {
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updatePersonnel',
          rowIndex: editingIndex,
          data: editData,
        }),
      });

      if (!response.ok) throw new Error('Erreur sauvegarde');

      const newPersonnel = [...personnel];
      newPersonnel[editingIndex] = editData;
      setPersonnel(newPersonnel);
      
      setEditingIndex(null);
      alert('✅ Fiche mise à jour avec succès!');
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
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
              <div className="personnel-grid">
                {filteredAgents.map((p, i) => (
                  <PersonnelCard
                    key={i}
                    personnel={p}
                    isEditing={editingIndex === i}
                    editData={editData}
                    onEdit={() => startEdit(i, p)}
                    onCancel={() => setEditingIndex(null)}
                    onSave={saveFiche}
                    onFieldChange={(field, value) => 
                      setEditData({ ...editData, [field]: value })
                    }
                  />
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
    </div>
  );
}

function PersonnelCard({
  personnel: p,
  isEditing,
  editData,
  onEdit,
  onCancel,
  onSave,
  onFieldChange,
}) {
  if (isEditing) {
    return (
      <div className="personnel-card editing">
        <h3>{editData.prenom} {editData.nom}</h3>
        <div className="edit-form">
          <div className="form-group">
            <label>NOM</label>
            <input type="text" value={editData.nom || ''} onChange={e => onFieldChange('nom', e.target.value)} />
          </div>
          <div className="form-group">
            <label>PRÉNOM</label>
            <input type="text" value={editData.prenom || ''} onChange={e => onFieldChange('prenom', e.target.value)} />
          </div>
          <div className="form-group">
            <label>🛡️ BAUDRIER</label>
            <input type="text" placeholder="Type" value={editData.baudrier_type || ''} onChange={e => onFieldChange('baudrier_type', e.target.value)} />
            <input type="text" placeholder="Numéro" value={editData.baudrier_num || ''} onChange={e => onFieldChange('baudrier_num', e.target.value)} />
            <input type="text" placeholder="Date (ex: 2026)" value={editData.baudrier_date || ''} onChange={e => onFieldChange('baudrier_date', e.target.value)} />
          </div>
          <div className="form-group">
            <label>🎩 CASQUE</label>
            <input type="text" placeholder="Type" value={editData.casque_type || ''} onChange={e => onFieldChange('casque_type', e.target.value)} />
            <input type="text" placeholder="Numéro" value={editData.casque_num || ''} onChange={e => onFieldChange('casque_num', e.target.value)} />
            <input type="text" placeholder="Date (ex: 2026)" value={editData.casque_date || ''} onChange={e => onFieldChange('casque_date', e.target.value)} />
          </div>
          <div className="form-group">
            <label>🪢 LONGE</label>
            <input type="text" placeholder="Type" value={editData.longe_type || ''} onChange={e => onFieldChange('longe_type', e.target.value)} />
            <input type="text" placeholder="Numéro" value={editData.longe_num || ''} onChange={e => onFieldChange('longe_num', e.target.value)} />
            <input type="text" placeholder="Date (ex: 2026)" value={editData.longe_date || ''} onChange={e => onFieldChange('longe_date', e.target.value)} />
          </div>
          <div className="form-group">
            <label>🔌 MOUSQUETON</label>
            <input type="text" placeholder="Type" value={editData.mousq_type || ''} onChange={e => onFieldChange('mousq_type', e.target.value)} />
            <input type="text" placeholder="Numéro 1" value={editData.mousq_num1 || ''} onChange={e => onFieldChange('mousq_num1', e.target.value)} />
            <input type="text" placeholder="Numéro 2" value={editData.mousq_num2 || ''} onChange={e => onFieldChange('mousq_num2', e.target.value)} />
          </div>
          <div className="form-group">
            <label>⬇️ DESCENDEUR</label>
            <input type="text" placeholder="Type" value={editData.desc_type || ''} onChange={e => onFieldChange('desc_type', e.target.value)} />
            <input type="text" placeholder="Numéro" value={editData.desc_num || ''} onChange={e => onFieldChange('desc_num', e.target.value)} />
            <input type="text" placeholder="Date (ex: 2026)" value={editData.desc_date || ''} onChange={e => onFieldChange('desc_date', e.target.value)} />
          </div>
          <div className="form-group">
            <label>✋ POIGNÉE</label>
            <input type="text" placeholder="Type" value={editData.poig_type || ''} onChange={e => onFieldChange('poig_type', e.target.value)} />
            <input type="text" placeholder="Numéro" value={editData.poig_num || ''} onChange={e => onFieldChange('poig_num', e.target.value)} />
            <input type="text" placeholder="Date (ex: 2026)" value={editData.poig_date || ''} onChange={e => onFieldChange('poig_date', e.target.value)} />
          </div>
        </div>
        <div className="edit-actions">
          <button className="btn-save" onClick={onSave}>💾 Sauvegarder</button>
          <button className="btn-cancel" onClick={onCancel}>✕ Annuler</button>
        </div>
      </div>
    );
  }

  return (
    <div className="personnel-card">
      <h3>{p.prenom} {p.nom}</h3>
      <div className="epi-grid">
        {p.baudrier_type && (
          <div className="epi-item">
            <span className="epi-label">🛡️ BAUDRIER</span>
            <span className="epi-value">{p.baudrier_type}</span>
            {p.baudrier_num && <span className="epi-num">#{p.baudrier_num}</span>}
            <span className="epi-date">{p.baudrier_date} {parseInt(p.baudrier_date) < 2026 ? '⚠️' : '✅'}</span>
          </div>
        )}
        {p.casque_type && (
          <div className="epi-item">
            <span className="epi-label">🎩 CASQUE</span>
            <span className="epi-value">{p.casque_type}</span>
            {p.casque_num && <span className="epi-num">#{p.casque_num}</span>}
            <span className="epi-date">{p.casque_date} {parseInt(p.casque_date) < 2026 ? '⚠️' : '✅'}</span>
          </div>
        )}
        {p.longe_type && (
          <div className="epi-item">
            <span className="epi-label">🪢 LONGE</span>
            <span className="epi-value">{p.longe_type}</span>
            {p.longe_num && <span className="epi-num">#{p.longe_num}</span>}
            <span className="epi-date">{p.longe_date} {parseInt(p.longe_date) < 2026 ? '⚠️' : '✅'}</span>
          </div>
        )}
        {p.mousq_type && (
          <div className="epi-item">
            <span className="epi-label">🔌 MOUSQUETON</span>
            <span className="epi-value">{p.mousq_type}</span>
            {p.mousq_num1 && <span className="epi-num">#{p.mousq_num1}</span>}
            <span className="epi-date">✅ Présent</span>
          </div>
        )}
        {p.desc_type && (
          <div className="epi-item">
            <span className="epi-label">⬇️ DESCENDEUR</span>
            <span className="epi-value">{p.desc_type}</span>
            {p.desc_num && <span className="epi-num">#{p.desc_num}</span>}
            <span className="epi-date">{p.desc_date} {parseInt(p.desc_date) < 2026 ? '⚠️' : '✅'}</span>
          </div>
        )}
        {p.poig_type && (
          <div className="epi-item">
            <span className="epi-label">✋ POIGNÉE</span>
            <span className="epi-value">{p.poig_type}</span>
            {p.poig_num && <span className="epi-num">#{p.poig_num}</span>}
            <span className="epi-date">{p.poig_date} {parseInt(p.poig_date) < 2026 ? '⚠️' : '✅'}</span>
          </div>
        )}
      </div>
      <button className="btn-edit" onClick={onEdit}>✏️ Éditer</button>
    </div>
  );
}

export default App;
