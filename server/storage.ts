import { users, medicalReports, type User, type InsertUser, type MedicalReport, type InsertMedicalReport, type HealthAssessmentReport } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createMedicalReport(report: InsertMedicalReport & { analysisResult: HealthAssessmentReport; uploadedFiles?: any[]; userId: number }): Promise<MedicalReport>;
  getMedicalReportsByPatient(patientName: string): Promise<MedicalReport[]>;
  getMedicalReportsByUser(userId: number): Promise<MedicalReport[]>;
  getMedicalReport(id: number): Promise<MedicalReport | undefined>;
  getAllMedicalReports(): Promise<MedicalReport[]>;
  deleteMedicalReport(id: number, userId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createMedicalReport(report: InsertMedicalReport & { analysisResult: HealthAssessmentReport; uploadedFiles?: any[]; userId: number }): Promise<MedicalReport> {
    const [medicalReport] = await db
      .insert(medicalReports)
      .values({
        userId: report.userId,
        patientName: report.patientName,
        patientAge: report.patientAge,
        patientGender: report.patientGender,
        examDate: report.examDate,
        reportData: report.reportData,
        uploadedFiles: report.uploadedFiles,
        analysisResult: report.analysisResult,
      })
      .returning();
    return medicalReport;
  }

  async getMedicalReportsByPatient(patientName: string): Promise<MedicalReport[]> {
    return await db
      .select()
      .from(medicalReports)
      .where(eq(medicalReports.patientName, patientName))
      .orderBy(medicalReports.createdAt);
  }

  async getMedicalReportsByUser(userId: number): Promise<MedicalReport[]> {
    return await db
      .select()
      .from(medicalReports)
      .where(eq(medicalReports.userId, userId))
      .orderBy(medicalReports.createdAt);
  }

  async getMedicalReport(id: number): Promise<MedicalReport | undefined> {
    const [report] = await db.select().from(medicalReports).where(eq(medicalReports.id, id));
    return report || undefined;
  }

  async getAllMedicalReports(): Promise<MedicalReport[]> {
    return await db
      .select()
      .from(medicalReports)
      .orderBy(medicalReports.createdAt);
  }

  async deleteMedicalReport(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(medicalReports).where(
      eq(medicalReports.id, id)
    );
    return (result.rowCount || 0) > 0;
  }
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

  async createMedicalReport(report: InsertMedicalReport & { analysisResult: HealthAssessmentReport; uploadedFiles?: any[]; userId: number }): Promise<MedicalReport> {
    const id = this.currentReportId++;
    const medicalReport: MedicalReport = {
      id,
      userId: report.userId,
      patientName: report.patientName,
      patientAge: report.patientAge,
      patientGender: report.patientGender || null,
      examDate: new Date(report.examDate),
      reportData: report.reportData,
      uploadedFiles: report.uploadedFiles || null,
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

  async getMedicalReportsByUser(userId: number): Promise<MedicalReport[]> {
    return Array.from(this.medicalReports.values()).filter(
      (report) => report.userId === userId
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

  async deleteMedicalReport(id: number, userId: number): Promise<boolean> {
    return this.medicalReports.delete(id);
  }
}

export const storage = new DatabaseStorage();
