import React, { useEffect, useState } from 'react';
import { listFlowcharts, loadFlowchart } from '../services/api';
import FlowchartPage from './FlowchartPage';

const DashboardPage = () => {
  const [savedFlows, setSavedFlows] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchSaved = async () => {
    setLoadingList(true);
    try {
      const { data } = await listFlowcharts();
      setSavedFlows(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleOpenSaved = async (id) => {
    try {
      const { data } = await loadFlowchart(id);
      setSelectedFlow({
        id: data.id,
        title: data.title,
        flowchart: data.flowchart
      });
      setReloadKey((k) => k + 1); // force FlowchartPage remount with new props
    } catch (err) {
      console.error(err);
      alert('Failed to open saved flowchart');
    }
  };

  const handleNewFlow = () => {
    setSelectedFlow(null);
    setReloadKey((k) => k + 1);
  };

  const handleSaved = () => {
    fetchSaved();
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <h3>Saved diagrams</h3>
          <button className="btn secondary" onClick={handleNewFlow}>
            New
          </button>
        </div>
        {loadingList ? (
          <div className="dashboard-empty">Loading your diagrams…</div>
        ) : savedFlows.length === 0 ? (
          <div className="dashboard-empty">
            No saved diagrams yet.
            <br />
            Create a new flow and hit Save.
          </div>
        ) : (
          <ul className="dashboard-list">
            {savedFlows.map((flow) => (
              <li
                key={flow.id}
                className={
                  'dashboard-item' + (selectedFlow?.id === flow.id ? ' dashboard-item--active' : '')
                }
              >
                <div className="dashboard-item-main">
                  <div className="dashboard-item-title">{flow.title}</div>
                  <div className="dashboard-item-meta">
                    Updated {new Date(flow.updated_at).toLocaleString()}
                  </div>
                </div>
                <button className="btn" onClick={() => handleOpenSaved(flow.id)}>
                  Open
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
      <section className="dashboard-content">
        <FlowchartPage
          key={reloadKey}
          initialId={selectedFlow?.id || null}
          initialTitle={selectedFlow?.title || 'Untitled Flowchart'}
          initialFlowchart={selectedFlow?.flowchart || null}
          onSaved={handleSaved}
        />
      </section>
    </div>
  );
};

export default DashboardPage;

