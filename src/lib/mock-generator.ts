import { Patient, Diagnosis, PatientStatus } from "@shared/types";
const FIRST_NAMES = ["Jill", "Chris", "Leon", "Claire", "Albert", "Ada", "Barry", "Rebecca", "Hunk", "Carlos", "Sherry", "William", "Annette", "Nicholai", "Mikhail", "Tyrell", "Murphy", "Brad", "Marvin", "Robert"];
const LAST_NAMES = ["Valentine", "Redfield", "Kennedy", "Wesker", "Wong", "Burton", "Chambers", "Oliveira", "Birkin", "Ginovaef", "Viktor", "Patrick", "Seeker", "Vickers", "Branagh", "Kendo", "Frost", "Forest", "Speyer", "Coen"];
const ICD10_DIAGNOSES: Diagnosis[] = [
  { code: "J06.9", description: "Acute upper respiratory infection, unspecified" },
  { code: "I10", description: "Essential (primary) hypertension" },
  { code: "E11.9", description: "Type 2 diabetes mellitus without complications" },
  { code: "M54.5", description: "Low back pain" },
  { code: "F41.1", description: "Generalized anxiety disorder" },
  { code: "Z00.00", description: "Encounter for general adult medical examination" },
  { code: "N39.0", description: "Urinary tract infection, site not specified" },
  { code: "K21.9", description: "Gastro-esophageal reflux disease without esophagitis" },
  { code: "G43.909", description: "Migraine, unspecified, not intractable" },
  { code: "M17.11", description: "Unilateral primary osteoarthritis, right knee" }
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
    const birthYear = 1950 + Math.floor(Math.random() * 55);
    const age = new Date().getFullYear() - birthYear;
    patients.push({
      id,
      mrn: `MRN-${100000 + i}`,
      name: `${firstName} ${lastName}`,
      age,
      gender: Math.random() > 0.5 ? "Male" : "Female",
      status: getRandom(STATUSES),
      lastVisit: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString(),
      primaryDiagnosis: getRandom(ICD10_DIAGNOSES),
      ssn: `XXX-XX-${1000 + i}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `(555) ${100 + Math.floor(Math.random() * 900)}-${1000 + Math.floor(Math.random() * 9000)}`,
      avatarUrl: `https://i.pravatar.cc/150?u=${id}`
    });
  }
  return patients;
}