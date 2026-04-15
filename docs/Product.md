# AiMedicare — Product Requirements Document
**Version:** 1.0  
**Country:** Kingdom of Bhutan  
**Governing Framework:** Ministry of Health (MoH), Gross National Happiness (GNH) Commission  
**Alignment:** Bhutan 13th Five-Year Plan | Constitutional Right to Free Healthcare  
**Date:** April 2026

---

## 1. Executive Summary

AiMedicare is Bhutan's first fully integrated digital health ecosystem — a three-way platform connecting Health Service Providers, Patients, and Pharmacies through a single, culturally rooted, AI-assisted application. It is designed to extend the reach of Bhutan's free public healthcare into its most remote dzongkhags, amplify the capacity of frontline health workers, and deliver seamless care to every Bhutanese citizen regardless of geography, literacy, or connectivity.

AiMedicare is not a transplant of a Western health app. It is built for Bhutan's mountains, its languages, its traditional medicine system, and its GNH values.

---

## 2. Problem Statement

Bhutan's healthcare system faces a distinct set of challenges that no existing digital health tool adequately addresses:

- **Geographic isolation:** Villages in Haa, Lhuntse, and Gasa are days away from the nearest BHU. Referral hospitals are even further.
- **Fragmented records:** Patient histories exist on paper, leading to lost information across transfers, referrals, and consultations.
- **Broken referral chains:** Patients referred from BHUs to district hospitals or JDWNRH frequently never arrive, with no tracking mechanism.
- **Drug stockouts:** BHUs routinely run out of essential medicines with no real-time visibility into supply.
- **Overburdened health workers:** Health assistants and CHWs operate without clinical decision support, often managing emergencies alone.
- **NCD surge:** Rapid urbanisation has driven a steep rise in hypertension, diabetes, and cardiovascular disease without a corresponding management infrastructure.
- **Teleconsultation gaps:** Rural health workers cannot efficiently connect with Thimphu-based specialists; patient data is not pre-shared before calls.
- **Traditional medicine silos:** Sowa Rigpa practitioners operate in isolation from allopathic providers with no shared records or drug interaction safeguards.

---

## 3. Vision

> *A quiet, culturally rooted, bilingual health companion — extending Bhutan's free public health system into its most remote valleys, strengthening the hands of its frontline health workers, and serving the deeper GNH goal: long life, good health, and happiness for every Bhutanese citizen.*

---

## 4. Core Architecture: The Three-Node Ecosystem

AiMedicare is structured around three interconnected actor nodes. All three communicate through a central platform, with role-based access ensuring each actor sees only what is relevant and permitted.

```
        HEALTH PROVIDERS
        (Doctors, BHU Staff, CHWs, Specialists)
              /         \
             /           \
            /             \
        PATIENTS ————— PHARMACY
     (Citizens, rural    (Pharmacies, MSD,
      & urban)            BHU Drug Stores)
```

Every interaction between any two nodes is mediated, logged, and secured through the AiMedicare platform.

---

## 5. Node Specifications

### 5.1 Node 1 — Health Service Providers

**Who:** Doctors at JDWNRH and district hospitals; health assistants at BHUs; Community Health Workers (CHWs); Sowa Rigpa practitioners; visiting and remote specialists.

#### 5.1.1 Patient Management
- Access a patient's full longitudinal health record: past diagnoses, prescriptions, allergies, lab results, vaccination history.
- View AI-generated pre-consultation summaries, particularly useful for transferred or teleconsult patients arriving from remote BHUs.
- Log consultation notes, diagnoses, and treatment plans digitally; all entries update the patient's record in real time.

#### 5.1.2 Digital Prescription and Referral
- Issue digital prescriptions that are instantly transmitted to the patient's app and the linked pharmacy — eliminating paper prescriptions entirely.
- Generate digital referral letters with full case notes attached when escalating patients between care levels (BHU → district → JDWNRH).
- Track referral completion — whether the referred patient arrived at the destination facility.

#### 5.1.3 Teleconsultation
- Rural health assistants can initiate video or voice consultations with doctors in Thimphu or Paro directly within AiMedicare.
- AI pre-fills patient vitals and symptom history before the call begins so specialist time is not wasted on basic intake.
- Specialist advice is logged post-call; digital prescriptions are issued directly to pharmacy as needed.

#### 5.1.4 Clinical Decision Support
- Step-by-step guidance for CHWs during emergencies when a doctor is unreachable.
- AI-assisted symptom triage for common conditions: respiratory infections, diarrheal disease, malaria (southern Bhutan), maternal health emergencies.
- Referral recommendation engine flagging when a patient must be escalated to a higher facility.

#### 5.1.5 Training and CPD
- Embedded microlearning modules for health assistants — short, scenario-based training on diagnosing and managing common conditions.
- AI-powered simulation for rare emergencies: obstetric emergencies, GLOF injuries, snake bites in southern districts.
- Digital tracking of Continuing Professional Development (CPD) hours for nurses and health assistants.

#### 5.1.6 Scheduling and Workload
- Daily appointment queue management with walk-in and emergency flagging.
- AI-suggested optimal follow-up timing based on disease severity and patient history.

---

### 5.2 Node 2 — Patients

**Who:** All Bhutanese citizens — urban residents in Thimphu, Phuentsholing, and Gelephu; rural populations across all 20 dzongkhags; elderly, low-literacy, and low-connectivity users.

#### 5.2.1 Health Identity and Registration
- Every Bhutanese citizen receives a unique health ID linked to their CID number, creating a single longitudinal health record that follows them across all facilities nationwide.
- Family accounts allow one device to manage the health records of an entire household — critical for elderly parents and young children.

#### 5.2.2 Appointments and Consultations
- Book appointments at BHUs, district hospitals, or JDWNRH directly — no more 5 AM queues.
- Request teleconsultations for minor ailments, NCD follow-ups, or mental health support without travel.
- AI symptom assessment before booking: guides patients to the appropriate level of care (BHU vs. district vs. referral) to prevent unnecessary hospital overcrowding.

#### 5.2.3 Health Records and Transparency
- View full personal health record — diagnoses, prescriptions, lab results, vaccination history — in Dzongkha or English.
- Receive lab results digitally with plain-language AI explanations of what results mean, reducing anxiety and unnecessary follow-up visits.
- Access children's immunisation schedules with push reminders before each due date.

#### 5.2.4 Prescription Tracking
- Instant notification when a provider issues a digital prescription — includes medication name, dosage, and instructions in Dzongkha.
- View nearest pharmacy with the prescribed medicine in stock before travelling.
- Daily medication reminders for active courses; automated refill alerts for chronic condition medications.

#### 5.2.5 NCD and Wellness Self-Monitoring
- Log blood pressure, blood glucose, weight, and other vitals at home; data flows automatically to the assigned health provider.
- AI flags dangerously abnormal readings to the provider for immediate follow-up.
- Culturally appropriate wellness content using Bhutanese foods (red rice, buckwheat, leafy greens), altitude-suited physical activity, and mindfulness content grounded in Buddhist practice.

#### 5.2.6 Emergency SOS
- One-tap emergency feature transmits the patient's GPS location and full health record to the nearest health facility.
- Triggers ambulance or helicopter medevac request through the system.
- Specifically designed for emergencies in GLOF-prone areas, landslide zones, and snake-bite-risk regions of southern Bhutan.

#### 5.2.7 Accessibility
- Functional on low-bandwidth and offline networks with sync on reconnection.
- Accessible on basic smartphones and feature phones via SMS or USSD.
- Voice-based interaction prioritised for users with low literacy.
- Full Dzongkha interface as primary language with regional dialect support and English for professionals.

---

### 5.3 Node 3 — Pharmacy

**Who:** Medical Supplies Depot (MSD) in Thimphu; district pharmacy stores; private pharmacies in urban centres; BHU drug stores in remote areas; National Traditional Medicine Hospital dispensary.

#### 5.3.1 Digital Prescription Fulfilment
- Receive incoming prescriptions in real time the moment a provider issues them.
- Pharmacist verifies patient identity (QR code or ID lookup) and dispenses with a single confirmation tap.
- System marks prescription as fulfilled and updates the patient's record so the provider is notified of collection.

#### 5.3.2 Inventory Management
- Live drug inventory that updates with every dispense.
- Automatic resupply requests to MSD when stock of any essential medicine falls below threshold.
- AI seasonal demand forecasting: increased ORS and antiparasitics in summer; cold and respiratory medicines in winter.
- Visibility of stock across all district pharmacies and MSD, enabling inter-district transfers to prevent local shortages.

#### 5.3.3 Drug Safety and Interaction Alerts
- AI alert when a dispensed drug interacts with another medicine the patient is currently on — drawn from their health record.
- Alert when a patient is allergic to a prescribed drug.
- Duplicate prescription detection for fraud prevention.

#### 5.3.4 Counselling Prompts
- Prescriptions arrive with auto-generated pharmacist counselling notes: key instructions specific to that medicine (take with food, avoid alcohol, complete the full course).
- Enables accurate patient counselling even under time pressure.

#### 5.3.5 Controlled Substance Tracking
- Full digital audit trail for controlled substances — morphine, opioids, benzodiazepines.
- MoH can monitor dispensing patterns across all facilities and detect anomalies.

#### 5.3.6 Multilingual Dispensing Labels
- All labels printed through AiMedicare to be in both Dzongkha and English — critical for rural patients who cannot read English-only labels.

---

## 6. Cross-Node Interaction Matrix

### Provider ↔ Patient
| Interaction | AiMedicare Mechanism |
|---|---|
| Consultation | In-person booking + teleconsultation bridge |
| Diagnosis | Instant digital record update |
| Prescription | Digital prescription pushed to patient app |
| Follow-up | Automated reminders, lab result delivery |
| Emergency referral | Digital referral with full case notes and tracking |

### Provider ↔ Pharmacy
| Interaction | AiMedicare Mechanism |
|---|---|
| Prescription issuance | Instant digital transmission, no paper |
| Drug availability check | Provider can view pharmacy stock before prescribing |
| Controlled drug oversight | Digital audit logs accessible to MoH |
| Supply forecasting | Aggregated prescribing data informs MSD procurement |

### Patient ↔ Pharmacy
| Interaction | AiMedicare Mechanism |
|---|---|
| Locating medicine | Patient views nearest pharmacy with stock available |
| Prescription collection | QR code or CID verification at counter |
| Refill reminders | Automated alerts when chronic medicines are running low |
| Medication instructions | Dzongkha instructions delivered via app |

---

## 7. Specialised Module Specifications

### 7.1 Maternal and Child Health Module
- Pregnancy monitoring tools for home and BHU use with AI risk-flagging for complications (pre-eclampsia, obstructed labour).
- Automated SMS reminders for ANC visits, vaccinations, and postnatal checkups to mothers in remote areas.
- Child immunisation tracking under Bhutan's Expanded Programme on Immunisation (EPI) with missed-dose alerts to health workers.
- Nutrition monitoring for under-five children with particular coverage of eastern dzongkhags where stunting prevalence remains elevated.

### 7.2 NCD Chronic Disease Module
- Patient-facing logging of blood pressure, glucose, and medication adherence with trend visualisation.
- AI flagging of dangerous trends to the assigned health provider.
- Remote prescription renewal for stable NCD patients, reducing unnecessary hospital travel.
- Mental health screening and counselling pathways, designed with stigma-reduction as a primary UX constraint.

### 7.3 Disease Surveillance Module
- Aggregation of anonymised health data from all BHUs and hospitals for early outbreak detection.
- Automated alerts to MoH and district health officers when anomalies are detected.
- Epidemiological dashboards integrated with Bhutan's Health Management Information System (HMIS).
- Climate and seasonal data integration to forecast disease surges: dengue, respiratory illness, waterborne disease post-floods.

### 7.4 Traditional Medicine (Sowa Rigpa) Integration Module
- Sowa Rigpa practitioners can issue digital traditional medicine prescriptions linked to the National Traditional Medicine Hospital dispensary.
- Drug-herb interaction flagging when patients are simultaneously on modern and traditional medicines.
- Complementary care pathway guidance helping patients navigate when traditional medicine is appropriate and when allopathic intervention is urgently needed.
- Sowa Rigpa practitioners included as full participants in the referral and teleconsultation ecosystem.

---

## 8. End-to-End User Experience Flow

```
1.  Patient feels unwell
           ↓
2.  Opens AiMedicare → AI symptom checker guides care level
           ↓
3.  Books BHU appointment or requests teleconsultation
           ↓
4.  Health provider reviews patient's full history on AiMedicare
           ↓
5.  Consultation happens (in-person or video)
           ↓
6.  Provider issues digital prescription → Patient notified instantly
           ↓
7.  Patient views nearest pharmacy with medicine in stock
           ↓
8.  Pharmacist receives prescription, verifies patient identity, dispenses
           ↓
9.  Drug interaction check clears → Medicine dispensed and labelled in Dzongkha
           ↓
10. Patient record updated → Provider notified of collection
           ↓
11. Daily medication reminders sent until course complete
           ↓
12. Follow-up appointment auto-scheduled if clinically indicated
```

---

## 9. GNH Alignment Principles

AiMedicare must embody GNH values in every design decision — not as decoration, but as structural requirements.

| GNH Domain | AiMedicare Design Requirement |
|---|---|
| **Psychological wellbeing** | Mental health modules grounded in Buddhist concepts of mindfulness and community; no alarm-inducing notification design |
| **Time and balance** | Notification settings avoid overwhelming users; system empowers rather than creates health anxiety |
| **Community vitality** | AiMedicare strengthens the CHW network — it is a tool for the CHW, never a replacement |
| **Cultural preservation** | All content, interface language, and visual design to reflect Bhutanese cultural identity and religious sensitivities including fasting periods that affect medication timing |
| **Good governance** | Full transparency in AI recommendations; all data stored within Bhutan under MoH control |

---

## 10. Bhutan-Specific Design Constraints

### 10.1 Free Healthcare Protection
Since Bhutan's healthcare is constitutionally free, AiMedicare must guarantee zero cost to the patient within the public system for all consultations, prescriptions, and drug collection. No hidden charges may be introduced through the digital layer.

### 10.2 BHU Drug Stores as Full Pharmacy Nodes
In remote areas, BHU drug stores are the only pharmacy available. They must be fully integrated as pharmacy nodes so rural patients experience the same connected care as urban patients.

### 10.3 Data Sovereignty
All patient-provider-pharmacy data must be hosted on Bhutan-based servers under MoH control. End-to-end encryption is mandatory. No patient health data shall transit through foreign data centres. This aligns with Bhutan's data sovereignty priorities under the 13th Five-Year Plan.

### 10.4 Human-in-the-Loop Mandate
No AI recommendation — whether diagnostic, referral, or prescriptive — may be acted upon without review by a qualified health worker or doctor. AI advises; humans decide. This is non-negotiable.

### 10.5 Explainable AI
When AI recommends a diagnosis, referral, or drug interaction alert, it must state the reasoning in plain language accessible to a health assistant — not output a binary decision without justification.

### 10.6 Anonymisation Standards
Given Bhutan's small, tight-knit communities, robust anonymisation is critical. A patient's record must not be traceable by name or household even within district health systems.

---

## 11. Technical Requirements Summary

| Requirement | Specification |
|---|---|
| **Connectivity** | Functional offline; syncs when connectivity available |
| **Supported devices** | Android smartphones (primary); feature phones via SMS/USSD |
| **Languages** | Dzongkha (primary), English (professional), regional dialect support |
| **Interaction modes** | Text, voice, SMS, USSD |
| **Data hosting** | Bhutan-based servers; MoH-controlled infrastructure |
| **Encryption** | End-to-end for all patient-provider-pharmacy communications |
| **Integration** | Bhutan HMIS; MSD inventory systems; CID national identity database |
| **AI model governance** | Explainability required; human-in-the-loop mandatory |
| **Prescription labels** | Bilingual Dzongkha and English output |
| **Audit trails** | Full digital logs for controlled substances |

---

## 12. Stakeholder Map

| Stakeholder | Role in AiMedicare |
|---|---|
| Ministry of Health (MoH) | Platform owner, data custodian, regulatory authority |
| JDWNRH | Primary referral node; specialist teleconsultation hub |
| District Health Offices | Regional administration; district-level data oversight |
| Basic Health Units (BHUs) | Primary care nodes; CHW interface point |
| Medical Supplies Depot (MSD) | Central pharmacy node; national drug supply management |
| National Traditional Medicine Hospital | Sowa Rigpa prescription and dispensary integration |
| Bhutanese Citizens | End users — patients across all 20 dzongkhags |
| Community Health Workers (CHWs) | Frontline operators; rural interface with the platform |
| GNH Commission | Values alignment and policy oversight |

---

## 13. Success Metrics

| Metric | Target |
|---|---|
| Rural BHU teleconsultation rate | ≥ 40% of remote consultations via AiMedicare within 3 years |
| Referral completion tracking | 90% of referrals tracked end-to-end within 2 years |
| Drug stockout incidents | 50% reduction at BHU level within 2 years |
| Digital prescription adoption | 80% of outpatient prescriptions issued digitally within 3 years |
| ANC reminder response rate | ≥ 70% of rural pregnant women receiving and acting on reminders |
| NCD patient adherence | Measurable improvement in blood pressure and glucose control for enrolled patients |
| User satisfaction | ≥ 85% patient satisfaction rating across urban and rural cohorts |

---

## 14. Phased Rollout Recommendation

### Phase 1 — Foundation (Year 1)
Deploy core patient health ID system, digital prescriptions, and pharmacy fulfilment in Thimphu and Phuentsholing. Integrate with JDWNRH and two district hospitals. Launch MSD inventory module.

### Phase 2 — Rural Expansion (Year 2)
Extend to all 20 dzongkhags. Activate BHU drug stores as pharmacy nodes. Deploy CHW decision support tools. Launch offline-first mode for low-connectivity areas. Activate SMS/USSD access for feature phones.

### Phase 3 — Full Integration (Year 3)
Activate Sowa Rigpa integration and traditional medicine prescription system. Full HMIS integration and epidemiological surveillance module. Launch NCD self-monitoring and mental health modules. Emergency SOS nationwide activation.

---

## 15. Closing Statement

AiMedicare is not a technology project with a healthcare application. It is a healthcare equity project with technology as its delivery mechanism. Its measure of success is not downloads or active users — it is whether a farmer in Lhuntse and a patient in Thimphu both receive the same informed care: a provider who knows their history, a prescription they can read, and a pharmacy that has their medicine ready.

That is the standard AiMedicare must meet. That is the standard Bhutan's citizens deserve.

---

*Document prepared in alignment with Bhutan's 13th Five-Year Plan, MoH strategic priorities, and GNH Commission values framework.*
