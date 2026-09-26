# Hungry Artisan — Multi-Forwarder Quoting & Landed Cost Analysis Decision System

> **Owner:** Wesley Quintero  
> **Executive Oversight:** Justin Hopkins (Founder & CEO) & Herbert Pamittan (Logistics Operations Manager)  
> **Status:** Operational Decision Support Interface (v0.1)  
> **Date:** September 2026  

---

## 1. Purpose & Core Objective

Provide a single operational decision interface for comparing China $\rightarrow$ destination freight quotes across multiple forwarders and calculating true landed logistics costs.

### Primary Objectives:
- **Standardized Quote Collection:** Capture diverse freight quotes across ocean, air, and Amazon Global Logistics (AGL).
- **Quote Normalization:** Convert non-standard quote formats (`$/CBM`, `$/KG`, lump-sum flat, per container, per carton, per pallet) into standardized total landed logistics costs.
- **Side-by-Side Comparison:** Compare quotes apples-to-apples with transparent line-item fee breakdowns.
- **Exception & Risk Auditing:** Highlight missing components (omitted chassis fees, pier pass, drayage), expired quotes, and unusually high accessorials.
- **Historical Cost Variance Tracking:** Track quoted vs. actual invoiced freight costs over time to establish negotiating leverage.
- **Human Approval Governance:** Enforce Hungry Artisan approval workflows (routing to Justin Hopkins or Herbert Pamittan). *The system is strictly decision support; it does NOT automatically book freight.*

---

## 2. Global Supply Chain Framework

Hungry Artisan operates across three primary regional fulfillment nodes:

| Region | Inbound Logistics Origin | Primary Storage Hub | Downstream Fulfillment Channels |
| :--- | :--- | :--- | :--- |
| **United States (US)** | Chinese Supplier via Amazon Global Logistics (AGL) / Ocean LCL & FCL | **Amazon Warehousing & Distribution (AWD)** | Amazon FBA (Auto-replenishment), Walmart WFS (Manual move requests), TikTok FBT (Manual move requests), Shopify DTC (WebBee / Map My Channel) |
| **Canada (CA)** | Chinese Supplier via Ocean to Port of Vancouver / Delta | **Proline Logistics Services (3PL Hub)** | Amazon FBA Canada (YHM1 Warehouse in Hamilton, ON via direct LTL freight dispatch) |
| **United Kingdom (UK)** | Chinese Supplier via Ocean to Southampton / Felixstowe | **SSD Logistix (3PL Hub)** | Amazon FBA UK (Direct pallet replenishment from Midlands facility) |

### Key Regional Workflows:
- **United States Operations:** Bulk inventory is shipped via Amazon AGL directly into Amazon Warehousing and Distribution (AWD). From AWD, stock automatically replenishes Amazon FBA. Multi-channel outbound move requests are manually executed from AWD to supply Walmart Fulfillment Services (WFS) and Fulfilled by TikTok (FBT).
- **Canada & UK Operations:** Shipments arrive from Chinese suppliers directly at third-party logistics (3PL) warehouses—**Proline Logistics** in Canada and **SSD Logistix** in the UK. Local FBA centers are replenished via LTL/carton shipments dispatched directly from these 3PL facilities.

---

## 3. Operations Directory & Key Contacts

| Name | Role / Organization | Contact Details | Key Responsibilities |
| :--- | :--- | :--- | :--- |
| **Justin Hopkins** | Founder & CEO, *Hungry Artisan* | `justin@hungryartisan.com` | Inbound shipments from China, operational oversight, manual transfer approvals. |
| **Herbert Pamittan** | Logistics Operations Manager, *Hungry Artisan* | `herbert@hungryartisan.com` | AWD transfers, Canada/UK 3PL replenishment execution, weekly reporting, sales monitoring. |
| **Wesley Quintero** | Freight Operations Specialist & System Owner | `wesley.ecomva@gmail.com` | Forwarder quote collection, normalization math, carrier SLA auditing, routing recommendations. |
| **Bert Abedirad** | Director / VP, *Proline Logistics Services (Canada)* | `info@prolinelogistics.ca`<br>`(604) 500-2055` | Canada 3PL warehousing, carton/pallet labeling, LTL freight dispatch to Amazon YHM1. |
| **Matt Terry** | Warehouse Manager, *SSD Logistix (UK)* | `office@ssdlogistix.com`<br>`01789 777 905` | UK 3PL warehouse management, customs receipt, and UK FBA shipment processing. |
| **Jules** | WebBee / Integration Specialist | *Internal Slack* | Multi-channel integration support (Map My Channel / WebBee). |

---

## 4. System Architecture & Boundaries

```
                    ┌────────────────────────┐
                    │     Google Sheets      │
                    │   Operational DB       │
                    └───────────┬────────────┘
                                │
                        Google Apps Script
                                │
              ┌─────────────────┴─────────────────┐
              │                                   │
        Data Validation                      Calculations
              │                                   │
              └─────────────────┬─────────────────┘
                                │
                          API / JSON
                                │
                    ┌───────────▼───────────┐
                    │       React App       │
                    │   Decision Interface  │
                    └───────────┬───────────┘
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                  │
        Quote Scenarios    Cost Analysis      History
             │                  │                  │
             └──────────────────┼──────────────────┘
                                │
                         Human Decision
                                │
                   Justin Hopkins / Herbert Pamittan
```

- **React App:** Serves as the decision support interface (quote entry, normalization, comparison, variance tracking). *React is NOT the source of truth.*
- **Google Sheets:** Acts as the authoritative operational data store containing Forwarders, Shipments, Quotes, Quote Components, Rate Cards, Historical Costs, Assumptions, and Audit Logs.
- **Google Apps Script (`Code.gs`):** Service layer providing JSON endpoint integration, data validation, and multi-tab synchronization.

---

## 5. Normalization & Cost Model

$$\text{Total Landed Logistics Cost} = \text{Freight} + \text{Origin Charges} + \text{Destination Charges} + \text{Customs} + \text{Handling} + \text{Surcharges} + \text{Accessorials}$$

$$\text{Cost / Unit} = \frac{\text{Total Logistics Cost}}{\text{Units}}$$

$$\text{Cost / CBM} = \frac{\text{Total Logistics Cost}}{\text{CBM}}$$

$$\text{Cost / KG} = \frac{\text{Total Logistics Cost}}{\text{Gross Weight (kg)}}$$

$$\text{Landed Cost Impact} = \text{FOB Product Unit Cost} + \text{Cost / Unit}$$

---

## 6. Features & Modules

1. **Quote Scenarios & Comparison Matrix:**
   - Multi-forwarder comparison per shipment with breakdown across Ocean/Air, Origin, Destination, Customs, and Surcharges.
   - Real-time exception flags: *Lowest Normalized Cost*, *Fastest Transit*, *Expired Quote Alert*, *Missing Quote Component*, and *High Surcharge Warning*.
2. **Global Supply Chain & Logistics Contacts:**
   - Detailed visual breakdown of US, Canada, and UK regional corridors.
   - Direct communication buttons (Email with pre-filled subject, Click-to-Call, Copy Email/Phone, and Copy Full Dossier).
3. **Historical Actual Cost & Variance Audit:**
   - Tracks completed shipments with Quoted vs. Actual Invoiced amounts and variance percentage.
   - Categorizes root causes (port demurrage, chassis split fees, clean truck charges) to build empirical negotiation evidence.
4. **Rate Card Management with Expiration Governance:**
   - Contracted lane rate cards with active/expired visual alerts. Expired rates cannot silently be used for new quotes.
5. **Google Sheets Sync & Apps Script Generator:**
   - Built-in `Code.gs` viewer ready to paste into Google Apps Script in under 60 seconds.
   - Full JSON bundle and CSV export/import for spreadsheets.
6. **Wesley's 10 Success Criteria Live Audit:**
   - Direct audit slide-over answering all 10 operational questions in real time.

---

## 7. Running the Application

```bash
# Install dependencies
npm install

# Start the Vite development server (Port 3000)
npm run dev

# Typecheck and lint codebase
npm run lint

# Build for production
npm run build
```
