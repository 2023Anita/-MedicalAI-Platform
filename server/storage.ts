import { users, medicalReports, type User, type InsertUser, type MedicalReport, type InsertMedicalReport, type HealthAssessmentReport } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createMedicalReport(report: InsertMedicalReport & { analysisResult: HealthAssessmentReport }): Promise<MedicalReport>;
  getMedicalReportsByPatient(patientName: string): Promise<MedicalReport[]>;
  getMedicalReport(id: number): Promise<MedicalReport | undefined>;
  getAllMedicalReports(): Promise<MedicalReport[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private medicalReports: Map<number, MedicalReport>;
  private currentUserId: number;
  private currentReportId: number;

  constructor() {
    this.users = new Map();
    this.medicalReports = new Map();
    this.currentUserId = 1;
    this.currentReportId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createMedicalReport(report: InsertMedicalReport & { analysisResult: HealthAssessmentReport }): Promise<MedicalReport> {
    const id = this.currentReportId++;
    const medicalReport: MedicalReport = {
      id,
      patientName: report.patientName,
      patientAge: report.patientAge,
      patientGender: report.patientGender || null,
      reportData: report.reportData,
      analysisResult: report.analysisResult as any,
      createdAt: new Date(),
    };
    this.medicalReports.set(id, medicalReport);
    return medicalReport;
  }

  async getMedicalReportsByPatient(patientName: string): Promise<MedicalReport[]> {
    return Array.from(this.medicalReports.values()).filter(
      (report) => report.patientName === patientName
    ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getMedicalReport(id: number): Promise<MedicalReport | undefined> {
    return this.medicalReports.get(id);
  }

  async getAllMedicalReports(): Promise<MedicalReport[]> {
    return Array.from(this.medicalReports.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}

export const storage = new MemStorage();
