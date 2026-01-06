import { Router } from 'express';
import { progressService } from '../services/progress.service';
import { authenticate, AuthenticatedRequest, asyncHandler } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/progress:
 *   post:
 *     tags:
 *       - Progress
 *     summary: Create progress entry
 *     description: Record a new progress entry with weight, measurements, mood, etc.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight:
 *                 type: number
 *                 description: Weight in kg
 *                 example: 75.5
 *               measurements:
 *                 type: object
 *                 description: Body measurements (e.g., chest, waist, hips)
 *                 example: { "chest": 95, "waist": 80, "hips": 95 }
 *               notes:
 *                 type: string
 *                 example: Feeling great today!
 *               mood:
 *                 type: string
 *                 enum: [great, good, okay, tired, sore]
 *                 example: good
 *               photoUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL to progress photo
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Entry date (defaults to now)
 *     responses:
 *       201:
 *         description: Progress entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProgressEntry'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const { weight, measurements, notes, mood, photoUrl, date } = req.body;

    const progress = await progressService.createProgress(userId, {
      weight,
      measurements,
      notes,
      mood,
      photoUrl,
      date: date ? new Date(date) : undefined,
    });

    res.status(201).json(progress);
  })
);

/**
 * @swagger
 * /api/progress:
 *   get:
 *     tags:
 *       - Progress
 *     summary: Get progress entries
 *     description: Retrieve all progress entries for the authenticated user
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Maximum number of entries to return
 *     responses:
 *       200:
 *         description: Progress entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProgressEntry'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    const progress = await progressService.getUserProgress(userId, limit);
    res.json(progress);
  })
);

/**
 * @swagger
 * /api/progress/stats:
 *   get:
 *     tags:
 *       - Progress
 *     summary: Get progress statistics
 *     description: Retrieve aggregated progress statistics (total entries, weight change, etc.)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Progress statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProgressStats'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/stats',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const stats = await progressService.getProgressStats(userId);
    res.json(stats);
  })
);

/**
 * @swagger
 * /api/progress/range:
 *   get:
 *     tags:
 *       - Progress
 *     summary: Get progress by date range
 *     description: Retrieve progress entries within a specific date range
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date of the range
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date of the range
 *     responses:
 *       200:
 *         description: Progress entries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProgressEntry'
 *       400:
 *         description: Missing required date parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/range',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ message: 'startDate and endDate are required' });
      return;
    }

    const progress = await progressService.getProgressByDateRange(
      userId,
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.json(progress);
  })
);

/**
 * @swagger
 * /api/progress/{id}:
 *   put:
 *     tags:
 *       - Progress
 *     summary: Update progress entry
 *     description: Update an existing progress entry
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Progress entry ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               weight:
 *                 type: number
 *                 description: Weight in kg
 *                 example: 75.5
 *               measurements:
 *                 type: object
 *                 description: Body measurements
 *                 example: { "chest": 95, "waist": 80 }
 *               notes:
 *                 type: string
 *                 example: Updated notes
 *               mood:
 *                 type: string
 *                 enum: [great, good, okay, tired, sore]
 *                 example: good
 *               photoUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Progress entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProgressEntry'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Progress entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { weight, measurements, notes, mood, photoUrl } = req.body;

    const progress = await progressService.updateProgress(userId, id as string, {
      weight,
      measurements,
      notes,
      mood,
      photoUrl,
    });

    res.json(progress);
  })
);

/**
 * @swagger
 * /api/progress/{id}:
 *   delete:
 *     tags:
 *       - Progress
 *     summary: Delete progress entry
 *     description: Delete a specific progress entry
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Progress entry ID
 *     responses:
 *       200:
 *         description: Progress entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Progress entry deleted successfully
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Progress entry not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:id',
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!.userId;
    const { id } = req.params;

    await progressService.deleteProgress(userId, id as string);
    res.json({ message: 'Progress entry deleted successfully' });
  })
);

export default router;
