import { Patient, Diagnosis, PatientStatus, ClinicalRecord, Treatment, MedicalHistoryItem, Vitals, Evidence } from "@shared/types";
const FIRST_NAMES = ["Jill", "Chris", "Leon", "Claire", "Albert", "Ada", "Barry", "Rebecca", "Hunk", "Carlos", "Sherry", "William", "Annette", "Nicholai", "Mikhail", "Tyrell", "Murphy", "Brad", "Marvin", "Robert"];
const LAST_NAMES = ["Valentine", "Redfield", "Kennedy", "Wesker", "Wong", "Burton", "Chambers", "Oliveira", "Birkin", "Ginovaef", "Viktor", "Patrick", "Seeker", "Vickers", "Branagh", "Kendo", "Frost", "Forest", "Speyer", "Coen"];
const ICD10_DIAGNOSES: Diagnosis[] = [
  { code: "J06.9", description: "Acute upper respiratory infection" },
  { code: "I10", description: "Essential (primary) hypertension" },
  { code: "E11.9", description: "Type 2 diabetes mellitus" },
  { code: "M54.5", description: "Low back pain" },
  { code: "F41.1", description: "Generalized anxiety disorder" },
  { code: "Z00.00", description: "General adult medical examination" },
  { code: "N39.0", description: "Urinary tract infection" },
  { code: "K21.9", description: "Gastro-esophageal reflux disease" },
  { code: "G43.909", description: "Migraine, unspecified" },
  { code: "M17.11", description: "Osteoarthritis, right knee" }
];
const SURGICAL_HISTORY = ["Appendectomy", "Cholecystectomy", "Tonsillectomy", "Knee Arthroscopy", "Hernia Repair"];
const MEDICATIONS = [
  { name: "Lisinopril", dosage: "10mg daily" },
  { name: "Metformin", dosage: "500mg twice daily" },
  { name: "Atorvastatin", dosage: "20mg nightly" },
  { name: "Amlodipine", dosage: "5mg daily" },
  { name: "Sertraline", dosage: "50mg daily" },
  { name: "Albuterol", dosage: "90mcg inhaler" }
];
const STATUSES: PatientStatus[] = ["Stable", "Stable", "Stable", "Observation", "Observation", "Urgent", "Discharged"];
function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
export function generateMockPatients(count: number = 50): Patient[] {
  const patients: Patient[] = [];
  for (let i = 0; i < count; i++) {
    const id = `p-${i + 1}`;
    const firstName = getRandom(FIRST_NAMES);
    const lastName = getRandom(LAST_NAMES);
    const age = 20 + Math.floor(Math.random() * 60);
    const status = getRandom(STATUSES);
    const primaryDiagnosis = getRandom(ICD10_DIAGNOSES);
    const history: MedicalHistoryItem[] = [
      { condition: getRandom(SURGICAL_HISTORY), date: "2018-05-12", status: "Resolved" },
      { condition: "Seasonal Allergies", date: "2015-02-20", status: "Chronic" }
    ];
    const medications: Treatment[] = [
      { id: `t-${i}-1`, name: getRandom(MEDICATIONS).name, dosage: getRandom(MEDICATIONS).dosage, startDate: "2023-01-10", status: "Active" }
    ];
    const vitals: Vitals[] = [
      {
        bp: status === 'Urgent' ? "150/95" : "122/80",
        hr: status === 'Urgent' ? 98 : 72,
        temp: 98.6,
        spo2: 98,
        weight: 175,
        recordedAt: new Date().toISOString()
      }
    ];
    const evidence: Evidence[] = [
      { id: `e-${i}-1`, name: "Initial_Assessment.pdf", type: "PDF", url: "#", date: "2023-12-01" }
    ];
    patients.push({
      id,
      mrn: `MRN-${100000 + i}`,
      name: `${firstName} ${lastName}`,
      age,
      gender: Math.random() > 0.5 ? "Male" : "Female",
      status,
      lastVisit: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString(),
      primaryDiagnosis,
      ssn: `XXX-XX-${1000 + i}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@aura.clinic`,
      phone: `(555) ${100 + Math.floor(Math.random() * 900)}-${1000 + Math.floor(Math.random() * 9000)}`,
      avatarUrl: `https://i.pravatar.cc/150?u=${id}`,
      clinicalRecord: { history, medications, vitals, evidence }
    });
  }
  return patients;
}