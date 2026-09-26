import React, { useState } from 'react';
import { OperationsContact, SupplyChainRegion } from '../types';
import { DataSourceBadge } from './DataSourceBadge';
import {
  GLOBAL_SUPPLY_CHAIN_FRAMEWORK,
  OPERATIONS_CONTACTS,
} from '../data/seedData';
import {
  Building2,
  Truck,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ShoppingBag,
  Copy,
  Check,
  Search,
  ExternalLink,
  MessageSquare,
  Users,
} from 'lucide-react';

export const OperationsDirectory: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<SupplyChainRegion>('US');
  const [contactSearch, setContactSearch] = useState('');
  const [contactCategory, setContactCategory] = useState<'ALL' | 'INTERNAL' | '3PL'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeFramework =
    GLOBAL_SUPPLY_CHAIN_FRAMEWORK.find((f) => f.region === selectedRegion) ||
    GLOBAL_SUPPLY_CHAIN_FRAMEWORK[0];

  const handleCopyText = (text: string, identifier: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(identifier);
    setTimeout(() => {
      setCopiedId((curr) => (curr === identifier ? null : curr));
    }, 2000);
  };

  const handleCopyFullContact = (contact: OperationsContact) => {
    const formatted = [
      `Name: ${contact.name}`,
      `Role: ${contact.role}`,
      `Organization: ${contact.organization}`,
      `Email: ${contact.email}`,
      contact.phone ? `Phone: ${contact.phone}` : null,
      contact.location ? `Location: ${contact.location}` : null,
      `Responsibilities: ${contact.responsibilities.join('; ')}`,
    ]
      .filter(Boolean)
      .join('\n');

    handleCopyText(formatted, `full-${contact.contact_id}`);
  };

  // Filter contacts
  const filteredContacts = OPERATIONS_CONTACTS.filter((contact) => {
    const isInternal = contact.organization.includes('Hungry Artisan');
    const matchesCategory =
      contactCategory === 'ALL' ||
      (contactCategory === 'INTERNAL' && isInternal) ||
      (contactCategory === '3PL' && !isInternal);

    const q = contactSearch.toLowerCase();
    const matchesSearch =
      contact.name.toLowerCase().includes(q) ||
      contact.role.toLowerCase().includes(q) ||
      contact.organization.toLowerCase().includes(q) ||
      contact.email.toLowerCase().includes(q) ||
      (contact.phone && contact.phone.toLowerCase().includes(q)) ||
      contact.responsibilities.some((r) => r.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Global Supply Chain Framework & Logistics Contacts</h2>
        <p className="text-xs text-neutral-400 mt-1">
          Complete operational architecture for US (AWD), Canada (Proline 3PL), and UK (SSD Logistix) corridors, with key liaison contacts and quick-action communication channels.
        </p>
      </div>

      {/* Part 1: Regional Supply Chain Architecture */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Architecture & Inbound Flow
              </span>
              <DataSourceBadge source={activeFramework.data_source} size="xs" />
            </div>
            <h3 className="text-base font-bold text-white">Regional Storage & Fulfillment Corridors</h3>
          </div>

          {/* Region Tabs (Segmented control) */}
          <div className="flex items-center gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-lg text-xs self-start sm:self-auto">
            {GLOBAL_SUPPLY_CHAIN_FRAMEWORK.map((item) => (
              <button
                key={item.region}
                onClick={() => setSelectedRegion(item.region)}
                className={`px-3 py-1.5 font-medium rounded transition-colors cursor-pointer ${
                  selectedRegion === item.region
                    ? 'bg-neutral-800 text-amber-400 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {item.region_name} ({item.region})
              </button>
            ))}
          </div>
        </div>

        {/* Corridor Pipeline Visual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: Inbound Origin */}
          <div className="p-4 bg-neutral-950/70 border border-neutral-800/80 rounded-lg space-y-2">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Inbound Logistics Origin</span>
            </div>
            <div className="font-bold text-sm text-neutral-100">{activeFramework.inbound_origin}</div>
            <div className="text-xs text-neutral-400 leading-relaxed">
              Consolidated ex-factory from Guangdong / Zhejiang suppliers via ocean freight to regional port of entry.
            </div>
          </div>

          {/* Step 2: Primary Storage Hub */}
          <div className="p-4 bg-neutral-950/70 border border-neutral-800/80 rounded-lg space-y-2 border-l-2 border-l-amber-500">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Primary Storage Hub</span>
            </div>
            <div className="font-bold text-sm text-amber-400">{activeFramework.primary_storage_hub}</div>
            <div className="text-xs text-neutral-400 leading-relaxed">
              Bulk buffer storage for inventory holding, carton de-stuffing, pallet prep, and downstream branch replenishment.
            </div>
          </div>

          {/* Step 3: Fulfillment Channels */}
          <div className="p-4 bg-neutral-950/70 border border-neutral-800/80 rounded-lg space-y-2">
            <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Active Fulfillment Channels</span>
            </div>
            <div className="space-y-1.5 pt-1">
              {activeFramework.fulfillment_channels.map((ch, idx) => (
                <div key={idx} className="text-xs text-neutral-200 flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{ch}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Operational Workflow Narrative Box */}
        <div className="p-4 bg-neutral-950 border border-neutral-800/90 rounded-lg space-y-2">
          <div className="text-xs font-semibold text-neutral-300">
            Operational SOP — {activeFramework.region_name} Inventory Lifecycle:
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {activeFramework.operational_workflow}
          </p>
        </div>
      </div>

      {/* Part 2: Logistics Contacts & Operational Directory */}
      <div id="logistics-contacts" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
              Direct Contact Directory
            </div>
            <h3 className="text-lg font-bold text-white">Logistics Contacts & Key Personnel</h3>
            <p className="text-xs text-neutral-400">
              Direct access and quick-action communication channels for Hungry Artisan leadership and regional 3PL partners.
            </p>
          </div>

          {/* Quick Counter */}
          <div className="text-xs text-neutral-400 font-mono self-start sm:self-auto">
            Showing <strong className="text-amber-400">{filteredContacts.length}</strong> of {OPERATIONS_CONTACTS.length} Key Contacts
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900 p-3 rounded-lg border border-neutral-800 text-xs">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              placeholder="Search by name, role, organization, or responsibility..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded pl-8 pr-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-neutral-950 border border-neutral-800 rounded">
            <button
              onClick={() => setContactCategory('ALL')}
              className={`px-3 py-1 font-medium rounded transition-colors cursor-pointer ${
                contactCategory === 'ALL'
                  ? 'bg-neutral-800 text-amber-400 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All Roles
            </button>
            <button
              onClick={() => setContactCategory('INTERNAL')}
              className={`px-3 py-1 font-medium rounded transition-colors cursor-pointer ${
                contactCategory === 'INTERNAL'
                  ? 'bg-neutral-800 text-amber-400 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Internal Leadership
            </button>
            <button
              onClick={() => setContactCategory('3PL')}
              className={`px-3 py-1 font-medium rounded transition-colors cursor-pointer ${
                contactCategory === '3PL'
                  ? 'bg-neutral-800 text-amber-400 shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              3PL Partners & Tech
            </button>
          </div>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => {
            const emailCopied = copiedId === `email-${contact.contact_id}`;
            const phoneCopied = copiedId === `phone-${contact.contact_id}`;
            const fullCopied = copiedId === `full-${contact.contact_id}`;

            return (
              <div
                key={contact.contact_id}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-colors shadow-xs"
              >
                <div>
                  {/* Top Bar: Organization & Location & Provenance */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-neutral-300">
                        {contact.organization}
                      </span>
                      <DataSourceBadge source={contact.data_source} size="xs" />
                    </div>
                    {contact.location && (
                      <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                        <span>{contact.location}</span>
                      </span>
                    )}
                  </div>

                  {/* Name & Role */}
                  <h4 className="font-bold text-base text-white">{contact.name}</h4>
                  <div className="text-xs text-amber-400 font-medium mb-3">{contact.role}</div>

                  {/* Contact Info lines with copy buttons */}
                  <div className="space-y-2 text-xs bg-neutral-950/60 border border-neutral-800/80 rounded p-3">
                    {/* Email item */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="text-neutral-200 font-mono text-[11px] truncate">
                          {contact.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyText(contact.email, `email-${contact.contact_id}`)}
                          title="Copy Email Address"
                          className="px-1.5 py-0.5 text-[10px] text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded transition-colors cursor-pointer flex items-center gap-1"
                        >
                          {emailCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Phone item (if present) */}
                    {contact.phone && (
                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-800/60">
                        <div className="flex items-center gap-2 truncate">
                          <Phone className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                          <span className="text-neutral-200 font-mono text-[11px]">
                            {contact.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyText(contact.phone!, `phone-${contact.contact_id}`)}
                            title="Copy Phone Number"
                            className="px-1.5 py-0.5 text-[10px] text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded transition-colors cursor-pointer flex items-center gap-1"
                          >
                            {phoneCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Responsibilities list without pills */}
                  <div className="mt-4 pt-3 border-t border-neutral-800/80">
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                      Key Responsibilities:
                    </div>
                    <ul className="space-y-1.5 text-xs text-neutral-300">
                      {contact.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 shrink-0 font-bold">·</span>
                          <span className="leading-snug">{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Footer: Quick Action Buttons */}
                <div className="pt-3 border-t border-neutral-800/80 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Action 1: Email / Message */}
                    <a
                      href={contact.email.includes('@') ? `mailto:${contact.email}?subject=Hungry%20Artisan%20Logistics%20Inquiry` : '#'}
                      className="py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 rounded transition-colors text-center font-medium flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Mail className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Email Directly</span>
                    </a>

                    {/* Action 2: Phone call if phone exists, else Copy Info */}
                    {contact.phone ? (
                      <a
                        href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                        className="py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 rounded transition-colors text-center font-medium flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>Call Direct</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCopyFullContact(contact)}
                        className="py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 rounded transition-colors text-center font-medium flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        {fullCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Card Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-neutral-400" />
                            <span>Copy Details</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {contact.phone && (
                    <button
                      type="button"
                      onClick={() => handleCopyFullContact(contact)}
                      className="w-full py-1 text-[11px] text-neutral-400 hover:text-neutral-200 text-center transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      {fullCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Full Handover Dossier Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Full Handover Dossier</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
