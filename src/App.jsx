import React, { useState, useEffect } from 'react';
import './App.css';
import { AlertButton } from './components/AlertButton';

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
