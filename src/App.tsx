import React, { useState, useEffect } from 'react';
import {
  Forwarder,
  Shipment,
  Quote,
  HistoricalShipment,
  RateCard,
  SheetsSyncState,
} from './types';
import {
  INITIAL_FORWARDERS,
  INITIAL_SHIPMENTS,
  INITIAL_QUOTES,
  INITIAL_HISTORICAL_SHIPMENTS,
  INITIAL_RATE_CARDS,
} from './data/seedData';
import { Navbar } from './components/Navbar';
import { ShipmentSelector } from './components/ShipmentSelector';
import { ScenarioComparison } from './components/ScenarioComparison';
import { ShipmentList } from './components/ShipmentList';
import { OperationsDirectory } from './components/OperationsDirectory';
import { HistoricalAnalysis } from './components/HistoricalAnalysis';
import { RateCardManager } from './components/RateCardManager';
import { ForwarderDirectory } from './components/ForwarderDirectory';
import { QuoteNormalizationModal } from './components/QuoteNormalizationModal';
import { ShipmentModal } from './components/ShipmentModal';
import { DecisionApprovalModal } from './components/DecisionApprovalModal';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { SuccessCriteriaChecklist } from './components/SuccessCriteriaChecklist';

const STORAGE_KEYS = {
  FORWARDERS: 'ha_freight_forwarders_v2',
  SHIPMENTS: 'ha_freight_shipments_v2',
  QUOTES: 'ha_freight_quotes_v2',
  HISTORY: 'ha_freight_history_v2',
  RATE_CARDS: 'ha_freight_rate_cards_v2',
  SYNC_STATE: 'ha_freight_sync_state_v2',
};

export default function App() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'comparison' | 'shipments' | 'framework' | 'history' | 'ratecards' | 'forwarders'
  >('comparison');

  // Core Data States with localStorage persistence
  const [forwarders, setForwarders] = useState<Forwarder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FORWARDERS);
    return saved ? JSON.parse(saved) : INITIAL_FORWARDERS;
  });

  const [shipments, setShipments] = useState<Shipment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
    return saved ? JSON.parse(saved) : INITIAL_SHIPMENTS;
  });

  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUOTES);
    return saved ? JSON.parse(saved) : INITIAL_QUOTES;
  });

  const [historicalShipments, setHistoricalShipments] = useState<HistoricalShipment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved ? JSON.parse(saved) : INITIAL_HISTORICAL_SHIPMENTS;
  });

  const [rateCards, setRateCards] = useState<RateCard[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RATE_CARDS);
    return saved ? JSON.parse(saved) : INITIAL_RATE_CARDS;
  });

  const [syncState, setSyncState] = useState<SheetsSyncState>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SYNC_STATE);
    return saved
      ? JSON.parse(saved)
      : {
          web_app_url: '',
          last_synced_at: null,
          status: 'connected',
          last_payload_summary: 'Operational store loaded with Hungry Artisan Global Supply Chain baseline.',
        };
  });

  // Active Shipment for Quote Comparison
  const [activeShipmentId, setActiveShipmentId] = useState<string>(
    shipments[0]?.shipment_id || 'SHP-2026-104',
  );

  // Modals state
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteToEdit, setQuoteToEdit] = useState<Quote | null>(null);

  const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
  const [shipmentToEdit, setShipmentToEdit] = useState<Shipment | null>(null);

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isSheetsSyncModalOpen, setIsSheetsSyncModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Sync back to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FORWARDERS, JSON.stringify(forwarders));
  }, [forwarders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historicalShipments));
  }, [historicalShipments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RATE_CARDS, JSON.stringify(rateCards));
  }, [rateCards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SYNC_STATE, JSON.stringify(syncState));
  }, [syncState]);

  const activeShipment =
    shipments.find((s) => s.shipment_id === activeShipmentId) || shipments[0];

  // Actions
  const handleSaveQuote = (newQuote: Quote) => {
    setQuotes((prev) => {
      const idx = prev.findIndex((q) => q.quote_id === newQuote.quote_id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newQuote;
        return updated;
      }
      return [newQuote, ...prev];
    });

    // Mark shipment status as comparing if not yet
    setShipments((prev) =>
      prev.map((s) =>
        s.shipment_id === newQuote.shipment_id && s.status === 'quoting'
          ? { ...s, status: 'comparing' }
          : s,
      ),
    );
  };

  const handleDeleteQuote = (quoteId: string) => {
    setQuotes((prev) => prev.filter((q) => q.quote_id !== quoteId));
  };

  const handleSaveShipment = (newShipment: Shipment) => {
    setShipments((prev) => {
      const idx = prev.findIndex((s) => s.shipment_id === newShipment.shipment_id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = newShipment;
        return updated;
      }
      return [newShipment, ...prev];
    });
    setActiveShipmentId(newShipment.shipment_id);
  };

  const handleSaveApproval = (payload: {
    selected_forwarder_id: string;
    approval_status: Shipment['approval_status'];
    approval_notes: string;
    approved_by: string;
  }) => {
    setShipments((prev) =>
      prev.map((s) =>
        s.shipment_id === activeShipmentId
          ? {
              ...s,
              selected_forwarder_id: payload.selected_forwarder_id,
              approval_status: payload.approval_status,
              approval_notes: payload.approval_notes,
              approved_by: payload.approved_by,
              approved_at: new Date().toISOString(),
              status: payload.approval_status === 'approved' ? 'approved' : s.status,
            }
          : s,
      ),
    );
  };

  const handleAddActualRecord = (record: HistoricalShipment) => {
    setHistoricalShipments((prev) => [record, ...prev]);
  };

  const handleAddRateCard = (card: RateCard) => {
    setRateCards((prev) => [card, ...prev]);
  };

  const handleDeleteRateCard = (cardId: string) => {
    setRateCards((prev) => prev.filter((c) => c.card_id !== cardId));
  };

  const handleAddForwarder = (fwd: Forwarder) => {
    setForwarders((prev) => [fwd, ...prev]);
  };

  const handleToggleActiveForwarder = (fwdId: string) => {
    setForwarders((prev) =>
      prev.map((f) => (f.forwarder_id === fwdId ? { ...f, active: !f.active } : f)),
    );
  };

  const handleImportData = (bundle: any) => {
    if (bundle.forwarders) setForwarders(bundle.forwarders);
    if (bundle.shipments) setShipments(bundle.shipments);
    if (bundle.quotes) setQuotes(bundle.quotes);
    if (bundle.historical_shipments) setHistoricalShipments(bundle.historical_shipments);
    if (bundle.rate_cards) setRateCards(bundle.rate_cards);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-neutral-100 flex flex-col font-sans">
      {/* 3-Zone Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewQuote={() => {
          setQuoteToEdit(null);
          setIsQuoteModalOpen(true);
        }}
        onOpenSheetsSync={() => setIsSheetsSyncModalOpen(true)}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        syncStatus={syncState.status}
      />

      {/* Shipment Specs Banner (Always visible in quote comparison tab) */}
      {activeTab === 'comparison' && (
        <ShipmentSelector
          shipments={shipments}
          activeShipmentId={activeShipmentId}
          onSelectShipment={(id) => setActiveShipmentId(id)}
          onOpenNewShipment={() => {
            setShipmentToEdit(null);
            setIsShipmentModalOpen(true);
          }}
          onOpenApproval={() => setIsApprovalModalOpen(true)}
          forwarders={forwarders}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'comparison' && activeShipment && (
          <ScenarioComparison
            shipment={activeShipment}
            quotes={quotes}
            forwarders={forwarders}
            onEditQuote={(quote) => {
              setQuoteToEdit(quote);
              setIsQuoteModalOpen(true);
            }}
            onDeleteQuote={handleDeleteQuote}
            onAddQuote={() => {
              setQuoteToEdit(null);
              setIsQuoteModalOpen(true);
            }}
            onSelectForApproval={(forwarderId) => {
              handleSaveApproval({
                selected_forwarder_id: forwarderId,
                approval_status: 'approved',
                approval_notes: 'Selected from side-by-side scenario comparison matrix.',
                approved_by: 'Justin Hopkins',
              });
            }}
          />
        )}

        {activeTab === 'shipments' && (
          <ShipmentList
            shipments={shipments}
            quotes={quotes}
            forwarders={forwarders}
            activeShipmentId={activeShipmentId}
            onSelectShipment={(id) => {
              setActiveShipmentId(id);
            }}
            onOpenNewShipment={() => {
              setShipmentToEdit(null);
              setIsShipmentModalOpen(true);
            }}
            onEditShipment={(shipment) => {
              setShipmentToEdit(shipment);
              setIsShipmentModalOpen(true);
            }}
            onViewComparison={(id) => {
              setActiveShipmentId(id);
              setActiveTab('comparison');
            }}
          />
        )}

        {activeTab === 'framework' && <OperationsDirectory />}

        {activeTab === 'history' && (
          <HistoricalAnalysis
            historicalShipments={historicalShipments}
            forwarders={forwarders}
            onAddActualRecord={handleAddActualRecord}
          />
        )}

        {activeTab === 'ratecards' && (
          <RateCardManager
            rateCards={rateCards}
            forwarders={forwarders}
            onAddRateCard={handleAddRateCard}
            onDeleteRateCard={handleDeleteRateCard}
          />
        )}

        {activeTab === 'forwarders' && (
          <ForwarderDirectory
            forwarders={forwarders}
            onAddForwarder={handleAddForwarder}
            onToggleActive={handleToggleActiveForwarder}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">Hungry Artisan</span>
            <span>·</span>
            <span>Global Supply Chain (US: AWD · CA: Proline · UK: SSD Logistix)</span>
            <span>·</span>
            <span>Owner: Wesley Quintero</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span>Operational DB: Google Sheets</span>
            <span>·</span>
            <span>Sign-off: Justin Hopkins & Herbert Pamittan</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isQuoteModalOpen && activeShipment && (
        <QuoteNormalizationModal
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          shipment={activeShipment}
          forwarders={forwarders.filter((f) => f.active)}
          quoteToEdit={quoteToEdit}
          onSaveQuote={handleSaveQuote}
        />
      )}

      {isShipmentModalOpen && (
        <ShipmentModal
          isOpen={isShipmentModalOpen}
          onClose={() => setIsShipmentModalOpen(false)}
          onSaveShipment={handleSaveShipment}
          existingShipment={shipmentToEdit}
        />
      )}

      {isApprovalModalOpen && activeShipment && (
        <DecisionApprovalModal
          isOpen={isApprovalModalOpen}
          onClose={() => setIsApprovalModalOpen(false)}
          shipment={activeShipment}
          quotes={quotes}
          forwarders={forwarders}
          onSaveApproval={handleSaveApproval}
        />
      )}

      {isSheetsSyncModalOpen && (
        <GoogleSheetsSyncModal
          isOpen={isSheetsSyncModalOpen}
          onClose={() => setIsSheetsSyncModalOpen(false)}
          syncState={syncState}
          onUpdateSyncState={(updates) => setSyncState((prev) => ({ ...prev, ...updates }))}
          forwarders={forwarders}
          shipments={shipments}
          quotes={quotes}
          historicalShipments={historicalShipments}
          rateCards={rateCards}
          onImportData={handleImportData}
        />
      )}

      {isAuditModalOpen && activeShipment && (
        <SuccessCriteriaChecklist
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          shipment={activeShipment}
          quotes={quotes}
          forwarders={forwarders}
          historicalShipments={historicalShipments}
        />
      )}
    </div>
  );
}
