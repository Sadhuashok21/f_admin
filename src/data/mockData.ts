import {
  User,
  Blueprint,
  BlueprintCategory,
  Internship,
  Company,
  Course,
  Video,
  Language,
  LogEntry,
  ActivityLog,
  DatabaseInfo,
  TableInfo,
  Movie,
  Song,
  BankAccount,
  Submission
} from '../types';

export const initialUsers: User[] = [];
export const initialBlueprints: Blueprint[] = [];
export const initialCategories: BlueprintCategory[] = [];
export const initialCompanies: Company[] = [];
export const initialInternships: Internship[] = [];
export const initialCourses: Course[] = [];
export const initialVideos: Video[] = [];
export const initialLanguages: Language[] = [];
export const initialSubmissions: Submission[] = [];
export const initialLogs: LogEntry[] = [];
export const initialActivityLogs: ActivityLog[] = [];
export const initialDatabases: DatabaseInfo[] = [];
export const initialDatabaseTables: Record<string, TableInfo[]> = {};
export const initialMovies: Movie[] = [];
export const initialSongs: Song[] = [];
export const initialBankAccounts: BankAccount[] = [];
