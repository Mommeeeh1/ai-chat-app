import { prisma } from '../lib/prisma';

export interface CreateProgressData {
  weight?: number;
  measurements?: Record<string, number>; // e.g., { chest: 100, waist: 80 }
  notes?: string;
  mood?: string;
  photoUrl?: string;
  date?: Date;
}

export interface ProgressStats {
  totalEntries: number;
  currentWeight: number | null;
  startWeight: number | null;
  weightChange: number | null;
  latestEntry: any;
  recentEntries: any[];
}

export const progressService = {
  /**
   * Create a new progress entry
   */
  async createProgress(userId: string, data: CreateProgressData) {
    return prisma.progress.create({
      data: {
        userId,
        weight: data.weight,
        measurements: data.measurements ? JSON.stringify(data.measurements) : null,
        notes: data.notes,
        mood: data.mood,
        photoUrl: data.photoUrl,
        date: data.date || new Date(),
      },
    });
  },

  /**
   * Get all progress entries for a user
   */
  async getUserProgress(userId: string, limit?: number) {
    const entries = await prisma.progress.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });

    return entries.map((entry) => ({
      ...entry,
      measurements: entry.measurements ? JSON.parse(entry.measurements) : null,
    }));
  },

  /**
   * Get progress entries within a date range
   */
  async getProgressByDateRange(userId: string, startDate: Date, endDate: Date) {
    const entries = await prisma.progress.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    return entries.map((entry) => ({
      ...entry,
      measurements: entry.measurements ? JSON.parse(entry.measurements) : null,
    }));
  },

  /**
   * Get progress statistics
   */
  async getProgressStats(userId: string): Promise<ProgressStats> {
    const entries = await prisma.progress.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        date: true,
        weight: true,
        notes: true,
        mood: true,
      },
    });

    const latestEntry = entries[entries.length - 1] || null;
    const firstEntry = entries[0] || null;

    const currentWeight = latestEntry?.weight || null;
    const startWeight = firstEntry?.weight || null;
    const weightChange = currentWeight && startWeight ? currentWeight - startWeight : null;

    return {
      totalEntries: entries.length,
      currentWeight,
      startWeight,
      weightChange,
      latestEntry,
      recentEntries: entries.slice(-10).reverse(), // Last 10 entries
    };
  },

  /**
   * Update a progress entry
   */
  async updateProgress(userId: string, progressId: string, data: CreateProgressData) {
    // Verify ownership
    const existing = await prisma.progress.findFirst({
      where: { id: progressId, userId },
    });

    if (!existing) {
      throw new Error('Progress entry not found');
    }

    return prisma.progress.update({
      where: { id: progressId },
      data: {
        weight: data.weight,
        measurements: data.measurements ? JSON.stringify(data.measurements) : undefined,
        notes: data.notes,
        mood: data.mood,
        photoUrl: data.photoUrl,
      },
    });
  },

  /**
   * Delete a progress entry
   */
  async deleteProgress(userId: string, progressId: string) {
    // Verify ownership
    const existing = await prisma.progress.findFirst({
      where: { id: progressId, userId },
    });

    if (!existing) {
      throw new Error('Progress entry not found');
    }

    return prisma.progress.delete({
      where: { id: progressId },
    });
  },
};


