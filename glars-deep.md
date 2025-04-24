# GLARS
# Geo-Legal Access Risk Score

*A framework for quantifying jurisdictional risks in data sovereignty assessments*

## Contents

- [Introduction](#introduction)
- [Terminology](#terminology)
- [GLARS Core Components](#glars-core-components)
- [Embargo and Sanctions Components](#embargo-and-sanctions-components)
- [Scoring Methodology](#scoring-methodology)
- [Risk Levels](#risk-levels)
- [Transfer Risk Assessment](#transfer-risk-assessment)
- [Vector Notation](#vector-notation)
- [Implementation Guidance](#implementation-guidance)
- [Use Cases](#use-cases)
- [Evolution Roadmap](#evolution-roadmap)
- [Security Considerations](#security-considerations)
- [References](#references)

## Introduction

Data sovereignty assessments currently lack a standardized approach for quantifying jurisdictional risk. The Geo-Legal Access Risk Score (GLARS) addresses this gap by providing an objective, reproducible methodology for evaluating legal risks associated with data location and movement across international boundaries.

GLARS draws inspiration from established scoring systems such as CVSS (Common Vulnerability Scoring System), adapting proven quantification approaches to the domain of legal jurisdiction assessment. The goal is to transform subjective risk assessments into objective, comparable scores that enable data-driven decision-making.

### Apolitical Principles

GLARS is designed to function as a strictly apolitical assessment framework. Its core principles include:

1. **Evidence-Based Assessment**: All evaluations rely solely on verifiable, publicly available information about legal frameworks, technical requirements, and enforcement mechanisms. The framework avoids subjective judgments or geopolitical interpretations.

2. **Objective Criteria**: The same evaluation criteria are applied consistently across all jurisdictions, regardless of political systems, alliances, or economic relationships. The methodology assesses the presence or absence of specific legal powers and mechanisms, not the governments that enact them.

3. **Transparency**: The assessment methodology is fully transparent, allowing users to understand exactly how scores are derived and which legal frameworks contribute to each evaluation.

4. **Focus on Legal Facts**: GLARS concentrates exclusively on the legal capabilities that exist within each jurisdiction, not on speculation about how those capabilities might be used. It measures what powers are legally available, not how they might be employed.

The framework encompasses three primary risk domains:
1. Legal access frameworks
2. Embargo restrictions
3. Sanctions regimes

## Terminology

| Term | Definition |
| --------- | ----------- |
| **Jurisdiction** | A geographical area with a distinct legal framework and authorities empowered to exercise legal control. |
| **Data sovereignty** | The concept that data is subject to the laws of the jurisdiction in which it resides. |
| **Legal access powers** | Legal authorities that enable government agencies to access data. |
| **Embargo** | A government order prohibiting or restricting commercial activities with specific countries. |
| **Sanction** | A targeted measure imposing restrictions on activities, often directed at specific entities, individuals, or sectors. |
| **Risk vector** | A standardized representation of risk factors using a consistent notation. |
| **Transfer risk** | The risk associated with moving data from one jurisdiction to another. |

## GLARS Core Components

GLARS evaluates risk across five primary legal dimensions:

### Judicial Oversight (JO)

> Evaluates the strength and independence of judicial review processes governing government access to data.

| Key Factors | Description |
| ----------- | ----------- |
| Prior judicial authorisation | Requirements for court approval before access |
| Independence of courts | Separation from the executive branch |
| Specificity requirements | Narrowness of access request parameters |
| Appeals process | Availability of meaningful review mechanisms |

**Example**: In Germany, government agencies must obtain approval from an independent court before accessing stored communications data, with specific constraints on the target and scope. The court operates independently of the investigating agencies, creating strong judicial oversight (low JO score). In contrast, in some countries, intelligence agencies can access data with only internal executive branch approval or through secret courts with limited independence (high JO score).

**Scoring**: 0-100, where higher scores indicate weaker oversight and higher risk.

### Agency Powers (AP)

> Assesses the breadth and depth of legal authorities granted to government agencies for data access.

| Key Factors | Description |
| ----------- | ----------- |
| Collection scope | Breadth of authorized access powers |
| Collection methods | Bulk vs. targeted collection authority |
| Provider compulsion | Powers to force service provider assistance |
| Extraterritorial claims | Claimed authority beyond borders |

**Example**: The US FISA Section 702 authorizes intelligence agencies to collect foreign intelligence information from non-US persons located abroad, including bulk collection capabilities. The CLOUD Act explicitly allows agencies to compel US-based providers to disclose data regardless of storage location. These broad powers result in a higher AP score compared to jurisdictions where agencies are limited to targeted collection with narrower scope.

**Scoring**: 0-100, where higher scores indicate broader powers and higher risk.

### Technical Requirements (TR)

> Measures mandated technical capabilities that providers must implement to facilitate government access.

| Key Factors | Description |
| ----------- | ----------- |
| Backdoor requirements | Mandated access mechanisms |
| Key escrow | Requirements to provide encryption keys |
| Data retention | Mandatory storage period obligations |
| Decryption capabilities | Legal requirements to enable decryption |
| Infrastructure modification | Powers to compel technical changes |

**Example**: The UK's Technical Capability Notices under the Investigatory Powers Act can compel providers to modify systems to enable interception and data collection. Australia's Assistance and Access Act allows authorities to require companies to create technical capabilities for accessing encrypted communications. These requirements create a high TR score compared to jurisdictions that don't mandate specific technical implementations for surveillance.

**Scoring**: 0-100, where higher scores indicate more extensive requirements and higher risk.

### Extraterritoriality (EX)

> Evaluates the degree to which a jurisdiction's legal frameworks assert authority beyond their borders.

| Key Factors | Description |
| ----------- | ----------- |
| Foreign-stored data claims | Powers over data stored outside borders |
| Provider nationality claims | Powers based on provider's country of origin |
| User nationality claims | Powers based on data subject citizenship |
| Corporate control claims | Powers based on corporate ownership structures |

**Example**: The US CLOUD Act explicitly claims authority over data held by US companies regardless of where the data is stored physically. Similarly, China's Data Security Law applies to data processing activities outside China that could harm China's national security. These expansive extraterritorial claims lead to higher EX scores compared to countries whose laws apply only to data within their territorial boundaries.

**Scoring**: 0-100, where higher scores indicate greater extraterritorial reach and higher risk.

### Transparency (TP)

> Analyses the visibility into government data access activities, including public reporting and notification.

| Key Factors | Description |
| ----------- | ----------- |
| Public reporting | Government disclosure of access statistics |
| User notification | Requirements to inform affected individuals |
| Gag order prevalence | Restrictions on service provider disclosures |
| Statistics availability | Availability of meaningful access metrics |

**Example**: Estonia and several Nordic countries publish detailed annual transparency reports on government data access requests and warrants issued, allowing public scrutiny of surveillance activities. Conversely, some countries' intelligence agencies can issue access demands with indefinite gag orders, preventing service providers from disclosing even the existence of requests. Jurisdictions with extensive gag order provisions and minimal public reporting receive higher TP scores (higher risk).

**Scoring**: 0-100, where higher scores indicate lower transparency and higher risk.

## Embargo and Sanctions Components

In addition to core legal components, GLARS incorporates two trade restriction factors:

### Embargo Impact (EI)

> Measures the severity of trade restrictions that prohibit or limit commercial activities with specific countries.

| Key Factors | Description |
| ----------- | ----------- |
| Comprehensiveness | Breadth and depth of restrictions |
| Issuing authorities | Number of governments imposing embargoes |
| Enforcement history | Pattern of past enforcement actions |
| Exceptions and licenses | Available carve-outs and exemptions |
| Blocking statutes | Conflicting legal requirements |

**Example**: The comprehensive US embargo against Cuba prohibits most transactions involving Cuban entities, including providing cloud services or data processing capabilities to Cuban companies. Similarly, EU embargoes against Russia restrict the export of certain technology and IT services. Organisations found violating these embargoes can face severe penalties, including substantial fines and criminal prosecution, resulting in high EI scores for these jurisdictions.

**Scoring**: 0-100, where higher scores indicate more severe embargo impacts and higher risk.

### Sanction Severity (SS)

> Evaluates targeted financial and economic restrictions affecting specific entities, individuals, or sectors.

| Key Factors | Description |
| ----------- | ----------- |
| Prohibited activities | Scope of restricted actions |
| Secondary exposure | Risk of secondary sanctions |
| Penalty levels | Severity of violation consequences |
| Screening requirements | Due diligence obligations |
| Humanitarian exceptions | Available exemptions for essential services |

**Example**: US sanctions against entities on the Specially Designated Nationals (SDN) list prohibit US persons from providing any services, including cloud computing or data storage, to listed entities. US secondary sanctions can also apply to non-US persons who engage with sanctioned entities. For instance, a European cloud provider working with sanctioned Russian financial institutions could face US secondary sanctions, requiring extensive screening procedures and creating high SS scores for jurisdictions with many sanctioned entities.

**Scoring**: 0-100, where higher scores indicate more severe sanctions and higher risk.

## Scoring Methodology

The GLARS framework uses a multi-layered approach to calculate risk scores.

### Base Score Calculation

```swift
BaseScore = (JO × 0.2) + (AP × 0.25) + (TR × 0.15) + (EX × 0.25) + (TP × 0.15)
```

> The base score evaluates the fundamental legal risk dimensions, with Agency Powers and Extraterritoriality weighted more heavily due to their significant impact.

### Enhanced Score with Trade Restrictions

```swift
GLARSScore = max(BaseScore, EmbargoImpact, SanctionSeverity)
```

> The final GLARS score takes the highest risk value from legal frameworks, embargoes, or sanctions, as each dimension independently can create prohibitive risks.

### Special Rule for Embargoes and Sanctions

**Important**: If any applicable embargo or sanction has a High risk level, the overall risk level is automatically elevated to High regardless of the numerical score. This reflects the serious compliance implications of violating trade restrictions.

## Risk Levels

GLARS scores are calibrated to three risk levels, each with specific implications for data handling:

### Low Risk (0-40)

*Strong legal protections with limited risk exposure*

| Aspect | Implications |
| ------ | ------------ |
| **Legal** | Strong legal protections with limited government access, transparent processes, and minimal extraterritorial claims |
| **Embargo** | No significant trade restrictions affecting data services or minimal restrictions with broad exceptions |
| **Sanctions** | No significant targeted restrictions affecting data operations or entities in this jurisdiction |

**Recommended controls**: Standard security measures and routine compliance monitoring.

### Medium Risk (41-65)

*Moderate access powers requiring enhanced controls*

| Aspect | Implications |
| ------ | ------------ |
| **Legal** | Moderate government access powers with some limitations, partial transparency, and bounded extraterritorial reach |
| **Embargo** | Partial trade restrictions that may limit certain data services or impose specific compliance requirements |
| **Sanctions** | Some targeted restrictions requiring enhanced due diligence and screening procedures |

**Recommended controls**: Enhanced encryption, data minimization, jurisdictional isolation, and regular compliance reviews.

### High Risk (66-100)

*Extensive access powers requiring significant mitigation*

| Aspect | Implications |
| ------ | ------------ |
| **Legal** | Broad government access powers, limited oversight, technical access requirements, and extensive extraterritorial claims |
| **Embargo** | Comprehensive trade restrictions prohibiting most data services and business interactions with this jurisdiction |
| **Sanctions** | Extensive targeted restrictions creating significant compliance risks for entities operating in this jurisdiction |

**Recommended controls**: Data localization in lower-risk jurisdictions, entity separation, zero-knowledge architectures, or avoidance of jurisdiction entirely.

## Transfer Risk Assessment

A key extension of the GLARS framework is the ability to evaluate risk between jurisdictions.

### Transfer Risk Formula

```swift
TransferRisk = (EmbargoDiff + SanctionDiff + LegalDiff + CompetingJurisdictionsRisk) × DataClassMultiplier
```

### Component Calculations

| Component | Calculation | Description |
| --------- | ----------- | ----------- |
| **Embargo Differential** | `max(0, DestEmbargoScore - SourceEmbargoScore)` | Increased embargo risk at destination |
| **Sanction Differential** | `max(0, DestSanctionScore - SourceSanctionScore)` | Increased sanctions risk at destination |
| **Legal Differential** | `max(0, DestLegalScore - SourceLegalScore)` | Increased legal access risk at destination |
| **Competing Jurisdictions Risk** | `(SourceLegalScore + DestLegalScore) ÷ 3` | Risk from overlapping legal claims |
| **Data Classification Multiplier** | Sensitivity factor (e.g., 2.5 for SECRET) | Adjustment based on data sensitivity |

## Vector Notation

GLARS uses a vector string format to enable precise communication of risk assessments.

### Format

```
GLARS:1.0/B:JO:57/AP:80/TR:68/EX:85/TP:58/EI:70/SS:55/T:HEF:1.1/TV:1.05/GS:0.95/E:IRM:1.1/DSF:1.2/OE:1.05
```

### Components

| Vector Group | Description | Example Values |
| ------------ | ----------- | -------------- |
| **GLARS version** | Framework version | 1.0 |
| **Base metrics (B)** | Core legal components | JO=57, AP=80, TR=68, EX=85, TP=58 |
| **Trade restrictions** | Embargo and sanction metrics | EI=70 (Embargo Impact), SS=55 (Sanction Severity) |
| **Temporal metrics (T)** | Time-based risk factors | HEF=1.1 (Historical Enforcement), TV=1.05 (Trend Vector) |
| **Environmental metrics (E)** | Context-specific multipliers | IRM=1.1 (Industry Risk), DSF=1.2 (Data Sensitivity) |

## Implementation Guidance

![Implementation Steps](https://via.placeholder.com/800x10/34c759/000000?text=+)

| Implementation Step | Description |
| ------------------ | ----------- |
| ![1](https://via.placeholder.com/20/34c759/000000?text=1) **Establish process** | Create a consistent assessment methodology |
| ![2](https://via.placeholder.com/20/34c759/000000?text=2) **Maintain legal database** | Keep jurisdictional frameworks up-to-date |
| ![3](https://via.placeholder.com/20/34c759/000000?text=3) **Document assumptions** | Record assessment rationale and evidence |
| ![4](https://via.placeholder.com/20/34c759/000000?text=4) **Schedule reviews** | Periodically reassess as legal landscapes change |
| ![5](https://via.placeholder.com/20/34c759/000000?text=5) **Vector documentation** | Capture both scores and vector notation |
| ![6](https://via.placeholder.com/20/34c759/000000?text=6) **Contextual weighting** | Adjust based on organizational specifics |
| ![7](https://via.placeholder.com/20/34c759/000000?text=7) **GRC integration** | Incorporate into broader governance frameworks |

## Use Cases

<div style="display:flex; flex-wrap:wrap; gap:10px;">

<div style="flex: 1 1 300px; background: rgba(0, 0, 0, 0.03); border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 4px; padding: 15px; margin-bottom: 15px;">
<h3>Cloud Provider Selection</h3>
<p>Compare jurisdictional risk profiles of different cloud service providers based on their corporate structure, data center locations, and applicable legal frameworks.</p>
</div>

<div style="flex: 1 1 300px; background: rgba(0, 0, 0, 0.03); border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 4px; padding: 15px; margin-bottom: 15px;">
<h3>Embargo Compliance</h3>
<p>Evaluate whether data transfers or service provisions would violate applicable trade restrictions, helping organizations avoid costly compliance violations.</p>
</div>

<div style="flex: 1 1 300px; background: rgba(0, 0, 0, 0.03); border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 4px; padding: 15px; margin-bottom: 15px;">
<h3>Multi-Region Architecture</h3>
<p>Design optimal multi-region deployments by quantifying the risk differences between jurisdictions and implementing appropriate data separation.</p>
</div>

<div style="flex: 1 1 300px; background: rgba(0, 0, 0, 0.03); border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 4px; padding: 15px; margin-bottom: 15px;">
<h3>Sanction Screening</h3>
<p>Assess potential business partnerships and customer relationships against sanction risks to ensure compliance with targeted restrictions.</p>
</div>

<div style="flex: 1 1 300px; background: rgba(0, 0, 0, 0.03); border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 4px; padding: 15px; margin-bottom: 15px;">
<h3>M&A Due Diligence</h3>
<p>Evaluate the jurisdictional risk exposure of target companies as part of privacy and compliance due diligence in mergers and acquisitions.</p>
</div>

<div style="flex: 1 1 300px; background: rgba(0, 0, 0, 0.03); border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 4px; padding: 15px; margin-bottom: 15px;">
<h3>Policy Creation</h3>
<p>Develop data governance policies with objective risk thresholds for different data types and processing activities based on GLARS scores.</p>
</div>

<div style="flex: 1 1 300px; background: rgba(0, 0, 0, 0.03); border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 4px; padding: 15px; margin-bottom: 15px;">
<h3>Transfer Firewalls</h3>
<p>Implement automated policy enforcement systems that evaluate data transfers against embargo, sanction, and legal risks in real-time.</p>
</div>

<div style="flex: 1 1 300px; background: rgba(0, 0, 0, 0.03); border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 4px; padding: 15px; margin-bottom: 15px;">
<h3>Compliance Documentation</h3>
<p>Generate evidence of due diligence for regulatory requirements by documenting quantified risk assessments and mitigation measures.</p>
</div>

</div>

## Evolution Roadmap

---

### Temporal Intelligence Factors

<table>
<tr>
<td width="33%" style="text-align:center">
<h4>Legislative Velocity</h4>
<p>Rate of change in legal frameworks</p>
</td>
<td width="33%" style="text-align:center">
<h4>Enforcement Trend Vector</h4>
<p>Directional changes in enforcement</p>
</td>
<td width="33%" style="text-align:center">
<h4>Geopolitical Stability</h4>
<p>Political factors affecting legal changes</p>
</td>
</tr>
</table>

### Industry Context Multipliers

<table>
<tr>
<td style="background-color:rgba(24, 144, 255, 0.1); padding:10px; border-radius:8px; text-align:center">Healthcare<br>1.2-1.5×</td>
<td style="background-color:rgba(24, 144, 255, 0.1); padding:10px; border-radius:8px; text-align:center">Financial<br>1.3-1.6×</td>
<td style="background-color:rgba(24, 144, 255, 0.1); padding:10px; border-radius:8px; text-align:center">Critical Infrastructure<br>1.4-1.7×</td>
<td style="background-color:rgba(24, 144, 255, 0.1); padding:10px; border-radius:8px; text-align:center">Telecommunications<br>1.3-1.5×</td>
</tr>
</table>

### Enforcement History Factors

<table>
<tr>
<td width="20%" style="text-align:center">
<h4>FEF</h4>
<p>Foreign Entity Focus</p>
</td>
<td width="20%" style="text-align:center">
<h4>ETE</h4>
<p>Extraterritorial Enforcement</p>
</td>
<td width="20%" style="text-align:center">
<h4>MPA</h4>
<p>Max Penalty Application</p>
</td>
<td width="20%" style="text-align:center">
<h4>IA</h4>
<p>Investigative Aggressiveness</p>
</td>
<td width="20%" style="text-align:center">
<h4>ASR</h4>
<p>Appeal Success Rate</p>
</td>
</tr>
</table>

### Data Sensitivity Factors

<div style="display:flex; justify-content:space-between; text-align:center; margin:20px 0;">
<div style="background-color:rgba(255, 59, 48, 0.1); border:1px solid #ff3b30; border-radius:8px; padding:10px; width:18%">
<strong>Critical</strong><br>2.0-2.5×
</div>
<div style="background-color:rgba(255, 149, 0, 0.1); border:1px solid #ff9500; border-radius:8px; padding:10px; width:18%">
<strong>Sensitive</strong><br>1.5-2.0×
</div>
<div style="background-color:rgba(0, 122, 255, 0.1); border:1px solid #007aff; border-radius:8px; padding:10px; width:18%">
<strong>Confidential</strong><br>1.2-1.5×
</div>
<div style="background-color:rgba(88, 86, 214, 0.1); border:1px solid #5856d6; border-radius:8px; padding:10px; width:18%">
<strong>Restricted</strong><br>1.0-1.2×
</div>
<div style="background-color:rgba(52, 199, 89, 0.1); border:1px solid #34c759; border-radius:8px; padding:10px; width:18%">
<strong>Public</strong><br>0.8-1.0×
</div>
</div>

### Jurisdiction Interaction Model

<table>
<tr>
<td style="background-color:rgba(255, 59, 48, 0.1); padding:10px; border-radius:8px;">
<strong>Cooperative Enforcement</strong> (Amplifying)<br>
When jurisdictions have mutual legal assistance treaties
</td>
<td style="background-color:rgba(52, 199, 89, 0.1); padding:10px; border-radius:8px;">
<strong>Legal Conflict</strong> (Mitigating)<br>
When jurisdictions have directly conflicting legal requirements
</td>
</tr>
<tr>
<td style="background-color:rgba(52, 199, 89, 0.1); padding:10px; border-radius:8px;">
<strong>Blocking Statutes</strong> (Mitigating)<br>
Laws designed to block extraterritorial reach
</td>
<td style="background-color:rgba(255, 59, 48, 0.1); padding:10px; border-radius:8px;">
<strong>Corporate Structure</strong> (Amplifying)<br>
Parent-subsidiary relationships creating exposures
</td>
</tr>
</table>

## Security Considerations

<div style="background-color: rgba(0, 0, 0, 0.05); border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 4px; padding: 20px; margin-bottom: 20px;">
<h3 style="margin-top: 0;">Important Security Notice</h3>

<ul>
<li><p><strong>Risk Assessment Sensitivity</strong> — GLARS assessments themselves may be sensitive information as they implicitly acknowledge compliance risks and could reveal organisational vulnerabilities.</p></li>
<li><p><strong>Compliance Strategy Exposure</strong> — Vector notation could reveal organisational assumptions about legal compliance strategies and risk tolerance.</p></li>
<li><p><strong>Access Controls</strong> — Implementation should include appropriate information handling protocols and access restrictions.</p></li>
<li><p><strong>Legal Privilege</strong> — Organisations should maintain legal professional privilege for legal interpretations underlying GLARS assessments.</p></li>
<li><p><strong>Test Data</strong> — Testing and documentation of GLARS implementations should not involve actual sensitive data.</p></li>
</ul>
</div>

## References

### North America

1. USA PATRIOT Act (Uniting and Strengthening America by Providing Appropriate Tools Required to Intercept and Obstruct Terrorism Act), Pub. L. No. 107-56, 115 Stat. 272 (2001). Available at: https://www.congress.gov/bill/107th-congress/house-bill/3162

2. Foreign Intelligence Surveillance Act of 1978 (FISA), 50 U.S.C. §§ 1801-1885c. Available at: https://www.govinfo.gov/content/pkg/STATUTE-92/pdf/STATUTE-92-Pg1783.pdf

3. Clarifying Lawful Overseas Use of Data Act (US CLOUD Act), H.R. 4943, 115th Congress (2018). Available at: https://www.congress.gov/bill/115th-congress/house-bill/4943

4. Executive Order 12333—United States Intelligence Activities, 46 FR 59941 (December 4, 1981). Available at: https://www.archives.gov/federal-register/codification/executive-order/12333.html

5. FISA Amendments Act of 2008, Pub. L. No. 110-261, 122 Stat. 2436. Available at: https://www.congress.gov/bill/110th-congress/house-bill/6304

6. Canada. (2019). "An Act respecting national security matters (Bill C-59)." S.C. 2019, c. 13. Available at: https://laws-lois.justice.gc.ca/eng/annualstatutes/2019_13/

7. Mexico. (2017). "Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados." Available at: http://www.diputados.gob.mx/LeyesBiblio/pdf/LGPDPPSO.pdf

### Europe

8. Investigatory Powers Act 2016 (UK). Available at: https://www.legislation.gov.uk/ukpga/2016/25/contents

9. UK Home Office. (2018). "Technical Capability Notices under the Investigatory Powers Act 2016." Available at: https://www.gov.uk/government/publications/technical-capability-notices

10. European Union. (2016). "Regulation (EU) 2016/679 of the European Parliament and of the Council of 27 April 2016 on the protection of natural persons with regard to the processing of personal data and on the free movement of such data, and repealing Directive 95/46/EC (General Data Protection Regulation)." Official Journal of the European Union, L119, 1-88. Available at: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679

11. European Union. (2018). "Directive (EU) 2018/1972 establishing the European Electronic Communications Code." Available at: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32018L1972

12. European Union. (1996). "Directive 96/9/EC of the European Parliament and of the Council of 11 March 1996 on the legal protection of databases." Available at: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A31996L0009

13. Germany. (2021). "Gesetz zur Anpassung des Datenschutzrechts an die Verordnung (EU) 2016/679 und zur Umsetzung der Richtlinie (EU) 2016/680 (Datenschutz-Anpassungs- und Umsetzungsgesetz EU - DSAnpUG-EU)." Available at: https://www.gesetze-im-internet.de/bdsg_2018/

14. France. (2018). "Loi n° 2018-493 du 20 juin 2018 relative à la protection des données personnelles." Available at: https://www.legifrance.gouv.fr/loda/id/JORFTEXT000037085952/

15. Russia. (2014). "Federal Law No. 242-FZ on Amendments to Certain Legislative Acts of the Russian Federation Regarding Clarifying the Procedure for Personal Data Processing in Information and Telecommunications Networks." Available at: http://publication.pravo.gov.ru/Document/View/0001201407220002

### Asia-Pacific

16. Information Technology Act, 2000 (India), Section 69. Available at: https://www.meity.gov.in/content/information-technology-act-2000

17. Ministry of Home Affairs, Government of India. (2019). "NATGRID: National Intelligence Grid." Available at: https://www.mha.gov.in/sites/default/files/NATGRID_23012019.pdf

18. Reserve Bank of India. (2018). "Storage of Payment System Data." RBI/2017-18/153. Available at: https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=11244

19. China. (2017). "Cybersecurity Law of the People's Republic of China." Available at: http://www.cac.gov.cn/2016-11/07/c_1119867116.htm

20. China. (2021). "Data Security Law of the People's Republic of China." Available at: http://www.npc.gov.cn/npc/c30834/202106/7c9af12f51334a73b56d7938f99a788a.shtml

21. China. (2021). "Personal Information Protection Law of the People's Republic of China." Available at: http://www.npc.gov.cn/npc/c30834/202108/a8c4e3672c74491a80b53a172bb753fe.shtml

22. Japan. (2003). "Act on the Protection of Personal Information (Act No. 57 of 2003)." Available at: https://www.ppc.go.jp/files/pdf/Act_on_the_Protection_of_Personal_Information.pdf

23. Australia. (2018). "Telecommunications and Other Legislation Amendment (Assistance and Access) Act 2018." Available at: https://www.legislation.gov.au/Details/C2018A00148

24. Singapore. (2012). "Personal Data Protection Act 2012." Available at: https://sso.agc.gov.sg/Act/PDPA2012

25. New Zealand. (2020). "Privacy Act 2020." Available at: https://www.legislation.govt.nz/act/public/2020/0031/latest/LMS23223.html

26. South Korea. (2011). "Personal Information Protection Act." Available at: https://www.law.go.kr/LSW/eng/engLsSc.do?menuId=2&section=lawNm&query=personal+information&x=0&y=0#liBgcolor0

### Middle East and Africa

27. Israel. (2017). "Protection of Privacy Law 5741-1981 (as amended)." Available at: https://www.gov.il/he/departments/legalInfo/legislation_privacy

28. United Arab Emirates. (2019). "Federal Law No. 2 of 2019 on the Use of Information and Communication Technology in Health Fields." Available at: https://u.ae/en/information-and-services/health-and-fitness/e-health

29. South Africa. (2013). "Protection of Personal Information Act 4 of 2013." Available at: https://www.gov.za/documents/protection-personal-information-act

### International Agreements and Organizations

30. Cox, J. (2018). "The Five Eyes: The Intelligence Alliance of the Anglosphere." UK Defense Journal. Available at: https://ukdefencejournal.org.uk/the-five-eyes-the-intelligence-alliance-of-the-anglosphere/

31. Office of the Director of National Intelligence. (2016). "Statistical Transparency Report Regarding the Use of National Security Authorities." Available at: https://www.dni.gov/files/documents/icotr/ic_transparecy_report_cy2015_-_final.pdf

32. United Nations. (2014). "The right to privacy in the digital age." Human Rights Council Resolution 28/16. Available at: https://documents-dds-ny.un.org/doc/UNDOC/GEN/G15/068/78/PDF/G1506878.pdf

33. Council of Europe. (1981). "Convention for the Protection of Individuals with regard to Automatic Processing of Personal Data." European Treaty Series No. 108. Available at: https://rm.coe.int/1680078b37


