import React, { useState, useEffect } from 'react';
import './App.css';
import { AlertButton } from './components/AlertButton';

function App() {
  const [personnel, setPersonnel] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadPersonnel();
    const interval = setInterval(loadPersonnel, 30000);
    return () => clearInterval(interval);
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

  const filtered = personnel.filter(p =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1>📋 EPI SMPM</h1>
          <p>Gestion des Équipements de Protection Individuelle</p>
        </div>
        <div className="header-right">
          <AlertButton />
        </div>
      </header>

      <main className="main-content">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Rechercher par nom..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="btn-refresh" onClick={loadPersonnel}>
            🔄 Actualiser
          </button>
        </div>

        {loading ? (
          <div className="loading">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="no-results">Aucun personnel trouvé</div>
        ) : (
          <div className="personnel-grid">
            {filtered.map((p, i) => (
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
        <h3>
          {editData.prenom} {editData.nom}
        </h3>

        <div className="edit-form">
          <div className="form-group">
            <label>NOM</label>
            <input
              type="text"
              value={editData.nom || ''}
              onChange={e => onFieldChange('nom', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>PRÉNOM</label>
            <input
              type="text"
              value={editData.prenom || ''}
              onChange={e => onFieldChange('prenom', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>🛡️ BAUDRIER</label>
            <input
              type="text"
              placeholder="Type"
              value={editData.baudrier_type || ''}
              onChange={e => onFieldChange('baudrier_type', e.target.value)}
            />
            <input
              type="text"
              placeholder="Numéro"
              value={editData.baudrier_num || ''}
              onChange={e => onFieldChange('baudrier_num', e.target.value)}
            />
            <input
              type="text"
              placeholder="Date (ex: 2026)"
              value={editData.baudrier_date || ''}
              onChange={e => onFieldChange('baudrier_date', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>🎩 CASQUE</label>
            <input
              type="text"
              placeholder="Type"
              value={editData.casque_type || ''}
              onChange={e => onFieldChange('casque_type', e.target.value)}
            />
            <input
              type="text"
              placeholder="Numéro"
              value={editData.casque_num || ''}
              onChange={e => onFieldChange('casque_num', e.target.value)}
            />
            <input
              type="text"
              placeholder="Date (ex: 2026)"
              value={editData.casque_date || ''}
              onChange={e => onFieldChange('casque_date', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>🪢 LONGE</label>
            <input
              type="text"
              placeholder="Type"
              value={editData.longe_type || ''}
              onChange={e => onFieldChange('longe_type', e.target.value)}
            />
            <input
              type="text"
              placeholder="Numéro"
              value={editData.longe_num || ''}
              onChange={e => onFieldChange('longe_num', e.target.value)}
            />
            <input
              type="text"
              placeholder="Date (ex: 2026)"
              value={editData.longe_date || ''}
              onChange={e => onFieldChange('longe_date', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>🔌 MOUSQUETON</label>
            <input
              type="text"
              placeholder="Type"
              value={editData.mousq_type || ''}
              onChange={e => onFieldChange('mousq_type', e.target.value)}
            />
            <input
              type="text"
              placeholder="Numéro 1"
              value={editData.mousq_num1 || ''}
              onChange={e => onFieldChange('mousq_num1', e.target.value)}
            />
            <input
              type="text"
              placeholder="Numéro 2"
              value={editData.mousq_num2 || ''}
              onChange={e => onFieldChange('mousq_num2', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>⬇️ DESCENDEUR</label>
            <input
              type="text"
              placeholder="Type"
              value={editData.desc_type || ''}
              onChange={e => onFieldChange('desc_type', e.target.value)}
            />
            <input
              type="text"
              placeholder="Numéro"
              value={editData.desc_num || ''}
              onChange={e => onFieldChange('desc_num', e.target.value)}
            />
            <input
              type="text"
              placeholder="Date (ex: 2026)"
              value={editData.desc_date || ''}
              onChange={e => onFieldChange('desc_date', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>✋ POIGNÉE</label>
            <input
              type="text"
              placeholder="Type"
              value={editData.poig_type || ''}
              onChange={e => onFieldChange('poig_type', e.target.value)}
            />
            <input
              type="text"
              placeholder="Numéro"
              value={editData.poig_num || ''}
              onChange={e => onFieldChange('poig_num', e.target.value)}
            />
            <input
              type="text"
              placeholder="Date (ex: 2026)"
              value={editData.poig_date || ''}
              onChange={e => onFieldChange('poig_date', e.target.value)}
            />
          </div>
        </div>

        <div className="edit-actions">
          <button className="btn-save" onClick={onSave}>
            💾 Sauvegarder
          </button>
          <button className="btn-cancel" onClick={onCancel}>
            ✕ Annuler
          </button>
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
            <span className="epi-date">
              {p.baudrier_date} {parseInt(p.baudrier_date) < 2026 ? '⚠️' : '✅'}
            </span>
          </div>
        )}

        {p.casque_type && (
          <div className="epi-item">
            <span className="epi-label">🎩 CASQUE</span>
            <span className="epi-value">{p.casque_type}</span>
            {p.casque_num && <span className="epi-num">#{p.casque_num}</span>}
            <span className="epi-date">
              {p.casque_date} {parseInt(p.casque_date) < 2026 ? '⚠️' : '✅'}
            </span>
          </div>
        )}

        {p.longe_type && (
          <div className="epi-item">
            <span className="epi-label">🪢 LONGE</span>
            <span className="epi-value">{p.longe_type}</span>
            {p.longe_num && <span className="epi-num">#{p.longe_num}</span>}
            <span className="epi-date">
              {p.longe_date} {parseInt(p.longe_date) < 2026 ? '⚠️' : '✅'}
            </span>
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
            <span className="epi-date">
              {p.desc_date} {parseInt(p.desc_date) < 2026 ? '⚠️' : '✅'}
            </span>
          </div>
        )}

        {p.poig_type && (
          <div className="epi-item">
            <span className="epi-label">✋ POIGNÉE</span>
            <span className="epi-value">{p.poig_type}</span>
            {p.poig_num && <span className="epi-num">#{p.poig_num}</span>}
            <span className="epi-date">
              {p.poig_date} {parseInt(p.poig_date) < 2026 ? '⚠️' : '✅'}
            </span>
          </div>
        )}
      </div>

      <button className="btn-edit" onClick={onEdit}>
        ✏️ Éditer
      </button>
    </div>
  );
}

export default App;
