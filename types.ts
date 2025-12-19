
export enum ECCStage {
  FIRST = '1ª Etapa',
  SECOND = '2ª Etapa',
  THIRD = '3ª Etapa'
}

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export type UserRole = 
  | 'NATIONAL_COUNCIL' 
  | 'NATIONAL_COUPLE' 
  | 'REGIONAL_COUPLE' 
  | 'SPIRITUAL_DIRECTOR' 
  | 'ARCHDIOCESAN_COUPLE' 
  | 'STAGE_1_TEAM' 
  | 'STAGE_2_TEAM' 
  | 'STAGE_3_TEAM'
  | 'COUPLE_USER'
  | 'ADMIN';

export interface Person {
  name: string;
  photoBase64: string | null;
  phone?: string;
  email?: string;
  occupation?: string;
}

export interface ECCDocument {
  id: string;
  name: string;
  type: string;
  data: string; // Base64
  uploadDate: string;
}

export interface ECCSong {
  id: string;
  title: string;
  author: string;
  stage: ECCStage;
  lyrics: string;
  videoUrl?: string;
  category: string;
}

export interface ParishCoordinatingTeam {
  casalMontagem: string;
  casalFicha: string;
  casalFinanca: string;
  casalRecepcaoPalestra: string;
  casalPosEncontro: string;
  termStart?: string;
  termEnd?: string;
}

export interface EncounterTeams {
  sala?: string;
  cafezinho?: string;
  cozinha?: string;
  ordemLimpeza?: string;
  visitacao?: string;
  circuloEstudo?: string;
  compras?: string;
  coordenadorGeral?: string;
  secretaria?: string;
  liturgia?: string;
  somProjecao?: string;
  recepcaoPalestrante?: string;
}

export interface EncounterRecord {
  id: string;
  stage: ECCStage;
  number: number;
  date: string;
  theme?: string;
  motto?: string;
  quadranteBase64?: string;
  coordinatingTeam?: ParishCoordinatingTeam;
  teams?: EncounterTeams;
  specificRoleInEncounter?: string;
}

export interface EventAttendee {
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  registrationDate: string;
}

export interface ECCEvent {
  id: string;
  title: string;
  type: 'ENCONTRO' | 'REUNIAO' | 'PALESTRA' | 'ESPIRITUALIDADE';
  stage: ECCStage | 'GERAL';
  startDate: string;
  endDate: string;
  location: string;
  theme?: string;
  motto?: string;
  coordinatingTeam?: ParishCoordinatingTeam;
  status: 'PLANEJADO' | 'REALIZADO' | 'CANCELADO';
  quadranteBase64?: string;
  description?: string;
  attendees?: EventAttendee[]; 
}

export interface ECCNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'SUCCESS' | 'INFO' | 'WARNING';
  read: boolean;
  createdAt: string;
}

export interface StageLeader {
  stage: ECCStage;
  coupleNames: string;
  teamName: string;
  termStart?: string;
  termEnd?: string;
}

export interface ApostolicRegion {
  id: string;
  name: string; 
  spiritualDirector: string;
  regionalDirector: string;
  nationalDirector: string;
  archdiocesanCouple: string;
  stageLeaders: StageLeader[];
  state: string;
  termStart?: string;
  termEnd?: string;
}

export interface Couple {
  id: string;
  husband: Person;
  wife: Person;
  address: string;
  phone: string;
  email: string;
  parish: string;
  region: string; 
  sectorName: string;
  sectorCouple: string;
  sectorTermStart?: string;
  sectorTermEnd?: string;
  city: string;
  state: string;
  isEngaged: boolean;
  pastoralGroup: string;
  weddingDate?: string;
  encounters: EncounterRecord[];
  documents: ECCDocument[];
  status: RegistrationStatus;
  createdAt: string;
  synced: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderParish: string;
  senderRegion: string;
  content: string;
  timestamp: string;
  isPrivate?: boolean;
  targetRole?: UserRole;
  room: 'ADMIN' | 'SUPPORT';
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  parish: string;
  region: string;
  jurisdiction?: string;
}
